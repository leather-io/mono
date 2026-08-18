import {
  activityCounterpartyOffset,
  formatActivityMoney,
} from '~/queries/activity/blockchain-activity.query';

import { btcAsset, stxAsset } from '@leather.io/constants';
import {
  type BlockchainActivityItem,
  type BlockchainActivityView,
  createBlockchainActivityItem,
} from '@leather.io/features';
import type {
  BlockchainActivity,
  BlockchainActivityBalanceChange,
  CryptoAsset,
  CryptoAssetChain,
  MarketData,
  Money,
  MultisigTransactionStatus,
  MultisigTransactionSummary,
  OnChainActivityStatus,
  Sip10Asset,
  StacksProtocolAction,
  StacksProtocolId,
} from '@leather.io/models';
import { assertUnreachable, baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

import {
  type DecodedProposalPayload,
  type ProposalPayloadContext,
  decodeProposalPayload,
  matchesProposalTokenAsset,
} from '../transactions/decode-proposal-payload';

export interface ProposalTokenInfo {
  asset: Sip10Asset;
  marketData?: MarketData;
}

export function mapMultisigTransactionStatus(
  status: MultisigTransactionStatus
): OnChainActivityStatus {
  switch (status) {
    case 'confirmed':
      return 'success';
    case 'failed':
    case 'dropped':
    case 'cancelled':
      return 'failed';
    case 'queued':
    case 'pending':
    case 'signed':
    case 'broadcast':
      return 'pending';
    default:
      return assertUnreachable(status);
  }
}

function buildSendBalanceChanges(
  asset: CryptoAsset,
  amount: Money | undefined,
  marketData: MarketData | undefined
): BlockchainActivityBalanceChange[] {
  if (!amount) return [];
  const quote =
    marketData && marketData.pair.base === amount.symbol
      ? baseCurrencyAmountInQuote(amount, marketData)
      : createMoney(0, 'USD');
  return [{ direction: 'sent', asset, amount: { crypto: amount, quote } }];
}

export interface MultisigActivityClassification {
  action: StacksProtocolAction;
  protocol?: StacksProtocolId;
  protocolName?: string;
}

interface CreateMultisigTransactionActivityViewOptions {
  rawPayload?: string;
  marketData?: MarketData;
  classifyContract?(
    contractId: string,
    functionName: string
  ): MultisigActivityClassification | undefined;
  getTokenInfo?(contractId: string): ProposalTokenInfo | undefined;
}

interface ActivityCommonFields {
  timestamp: number;
  txid: string;
  nonce?: number;
  status: OnChainActivityStatus;
  chain: CryptoAssetChain;
  initiatedByUser: boolean;
}

function buildProposalActivity(
  common: ActivityCommonFields,
  payload: DecodedProposalPayload | null,
  options: CreateMultisigTransactionActivityViewOptions
): BlockchainActivity {
  if (!payload) return { ...common, action: 'contract-execution', balanceChanges: [] };
  switch (payload.type) {
    case 'btcTransfer':
    case 'stxTransfer':
      return {
        ...common,
        action: 'send',
        counterparty: payload.recipient,
        fee: payload.fee,
        balanceChanges: buildSendBalanceChanges(
          common.chain === 'bitcoin' ? btcAsset : stxAsset,
          payload.amount,
          options.marketData
        ),
      };
    case 'sip10Transfer': {
      const token = options.getTokenInfo?.(payload.token.contractId);
      if (!token || !matchesProposalTokenAsset(token.asset, payload.token.assetName))
        return {
          ...common,
          action: 'contract-execution',
          fee: payload.fee,
          contract: {
            type: 'call',
            contractId: payload.token.contractId,
            functionName: 'transfer',
          },
          balanceChanges: [],
        };
      const crypto = createMoney(
        payload.token.baseUnitAmount,
        token.asset.symbol,
        token.asset.decimals
      );
      const quote =
        token.marketData && token.marketData.pair.base === crypto.symbol
          ? baseCurrencyAmountInQuote(crypto, token.marketData)
          : createMoney(0, 'USD');
      return {
        ...common,
        action: 'send',
        counterparty: payload.recipient,
        fee: payload.fee,
        balanceChanges: [
          {
            direction: 'sent',
            asset: token.asset,
            amount: { crypto, quote },
          },
        ],
      };
    }
    case 'contractCall': {
      const classification = options.classifyContract?.(payload.contractId, payload.functionName);
      return {
        ...common,
        action: classification?.action ?? 'contract-execution',
        protocol: classification?.protocol,
        protocolName: classification?.protocolName,
        fee: payload.fee,
        contract: {
          type: 'call',
          contractId: payload.contractId,
          functionName: payload.functionName,
        },
        balanceChanges: [],
      };
    }
    case 'contractDeploy':
      return {
        ...common,
        action: 'contract-deploy',
        fee: payload.fee,
        contract: { type: 'deploy', contractId: payload.contractId },
        balanceChanges: [],
      };
    default:
      return assertUnreachable(payload);
  }
}

type MultisigTransactionActivitySource = Pick<
  MultisigTransactionSummary,
  'id' | 'proposalTimestamp' | 'nonce' | 'txId' | 'status'
>;

export function createMultisigTransactionActivityItem(
  context: ProposalPayloadContext,
  transaction: MultisigTransactionActivitySource,
  options: CreateMultisigTransactionActivityViewOptions = {}
): BlockchainActivityItem {
  const chain: CryptoAssetChain = context.network.startsWith('btc') ? 'bitcoin' : 'stacks';
  const payload = options.rawPayload ? decodeProposalPayload(context, options.rawPayload) : null;

  const common: ActivityCommonFields = {
    timestamp: transaction.proposalTimestamp,
    txid: transaction.txId ?? transaction.id,
    ...(transaction.nonce === null ? {} : { nonce: transaction.nonce }),
    status: mapMultisigTransactionStatus(transaction.status),
    chain,
    initiatedByUser: true,
  };

  return createBlockchainActivityItem(buildProposalActivity(common, payload, options), {
    formatMoney: formatActivityMoney,
    counterpartyTruncateOffset: activityCounterpartyOffset,
  });
}

export function createMultisigTransactionActivityView(
  context: ProposalPayloadContext,
  transaction: MultisigTransactionActivitySource,
  options: CreateMultisigTransactionActivityViewOptions = {}
): BlockchainActivityView {
  return createMultisigTransactionActivityItem(context, transaction, options).view;
}
