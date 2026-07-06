import { formatCurrency } from '~/utils/currency-formatter';

import { btcAsset, stxAsset } from '@leather.io/constants';
import { type BlockchainActivityView, createBlockchainActivityView } from '@leather.io/features';
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
  StacksProtocolAction,
  StacksProtocolId,
} from '@leather.io/models';
import { assertUnreachable, baseCurrencyAmountInQuote } from '@leather.io/utils';

import {
  type DecodedProposalPayload,
  type ProposalPayloadContext,
  decodeProposalPayload,
} from '../transactions/decode-proposal-summary';

function mapMultisigTransactionStatus(status: MultisigTransactionStatus): OnChainActivityStatus {
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
  if (!amount || !marketData || marketData.pair.base !== amount.symbol) return [];
  return [
    {
      direction: 'sent',
      asset,
      amount: { crypto: amount, quote: baseCurrencyAmountInQuote(amount, marketData) },
    },
  ];
}

export interface MultisigActivityClassification {
  action: StacksProtocolAction;
  protocol?: StacksProtocolId;
  protocolName?: string;
}

interface CreateMultisigTransactionActivityViewOptions {
  rawPayload?: string;
  marketData?: MarketData;
  classification?: MultisigActivityClassification;
}

interface ActivityCommonFields {
  timestamp: number;
  txid: string;
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
    case 'contractCall':
      return {
        ...common,
        action: options.classification?.action ?? 'contract-execution',
        protocol: options.classification?.protocol,
        protocolName: options.classification?.protocolName,
        fee: payload.fee,
        contract: {
          type: 'call',
          contractId: payload.contractId,
          functionName: payload.functionName,
        },
        balanceChanges: [],
      };
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

export function createMultisigTransactionActivityView(
  context: ProposalPayloadContext,
  transaction: MultisigTransactionSummary,
  options: CreateMultisigTransactionActivityViewOptions = {}
): BlockchainActivityView {
  const chain: CryptoAssetChain = context.network.startsWith('btc') ? 'bitcoin' : 'stacks';
  const payload = options.rawPayload ? decodeProposalPayload(context, options.rawPayload) : null;

  const common: ActivityCommonFields = {
    timestamp: transaction.proposalTimestamp,
    txid: transaction.txId ?? transaction.id,
    status: mapMultisigTransactionStatus(transaction.status),
    chain,
    initiatedByUser: true,
  };

  return createBlockchainActivityView(buildProposalActivity(common, payload, options), {
    formatMoney: formatCurrency,
  });
}
