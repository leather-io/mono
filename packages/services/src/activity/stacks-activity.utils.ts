import { entries, filter, groupBy, isNonNull, mapValues, pipe } from 'remeda';

import { stxAsset } from '@leather.io/constants';
import type {
  BlockchainActivity,
  BlockchainActivityBalanceChange,
  CryptoAssetId,
  Money,
  OnChainActivityStatus,
  StacksProtocolAction,
  StacksProtocolId,
  StacksTx,
} from '@leather.io/models';
import { assertUnreachable, createMoney, initBigNumber } from '@leather.io/utils';

import type {
  HiroBalanceChangeResultItem,
  HiroPrincipalTransaction,
  HiroPrincipalTransactionsResultItem,
  HiroPrincipalTxStatus,
} from '../infrastructure/api/hiro/hiro-stacks-api.types';
import type { ActivitySourceItem } from './activity-paginator';
import {
  isMempoolTx,
  mapStacksTxBlockHeight,
  mapStacksTxBlockTime,
} from './stacks-tx-activity.utils';

type StacksActivityResultItem = HiroPrincipalTransactionsResultItem & {
  readonly transaction: Extract<
    HiroPrincipalTransaction,
    { type: 'token_transfer' | 'contract_call' | 'smart_contract' }
  >;
};

export function isStacksActivityResultItem(
  item: HiroPrincipalTransactionsResultItem
): item is StacksActivityResultItem {
  const { type } = item.transaction;
  return type === 'token_transfer' || type === 'contract_call' || type === 'smart_contract';
}

export function mapStacksActivityStatus(status: HiroPrincipalTxStatus): OnChainActivityStatus {
  return status === 'success' ? 'success' : 'failed';
}

type StacksTxCore =
  | { readonly kind: 'token_transfer'; readonly recipient: string; readonly sender: string }
  | { readonly kind: 'smart_contract'; readonly contractId: string }
  | { readonly kind: 'contract_call'; readonly contractId: string; readonly functionName: string };

interface StacksActivityCommon {
  readonly txid: string;
  readonly timestamp: number;
  readonly status: OnChainActivityStatus;
  readonly initiatedByUser: boolean;
  readonly fee?: Money;
  readonly blockHeight?: number;
}

export function buildStacksActivity({
  common,
  core,
  action,
  protocol,
  protocolName,
  counterparty,
  balanceChanges,
}: {
  common: StacksActivityCommon;
  core: StacksTxCore;
  action: StacksProtocolAction;
  protocol?: StacksProtocolId;
  protocolName?: string;
  counterparty?: string;
  balanceChanges: BlockchainActivityBalanceChange[];
}): BlockchainActivity {
  const base = {
    ...common,
    chain: 'stacks' as const,
    action,
    balanceChanges,
    ...(protocol ? { protocol } : {}),
    ...(protocolName ? { protocolName } : {}),
  };
  switch (core.kind) {
    case 'token_transfer':
      return { ...base, counterparty: common.initiatedByUser ? core.recipient : core.sender };
    case 'smart_contract':
      return { ...base, contract: { type: 'deploy', contractId: core.contractId } };
    case 'contract_call':
      return {
        ...base,
        ...(counterparty ? { counterparty } : {}),
        contract: { type: 'call', contractId: core.contractId, functionName: core.functionName },
      };
    default:
      return assertUnreachable(core);
  }
}

export function buildStxBalanceChange(net: string): BlockchainActivityBalanceChange | null {
  const amount = initBigNumber(net);
  if (amount.isZero()) return null;
  return {
    direction: amount.isNegative() ? 'sent' : 'received',
    asset: stxAsset,
    amount: { crypto: createMoney(amount.abs(), 'STX'), quote: createMoney(0, 'USD') },
  };
}

const sip10TransferFunctionName = 'transfer';

export interface ClassifiedContractCall {
  readonly action: StacksProtocolAction;
  readonly protocol?: StacksProtocolId;
  readonly protocolName?: string;
  readonly counterparty?: string;
}

export function reclassifySip10Transfer(
  classified: ClassifiedContractCall,
  functionName: string,
  balanceChanges: BlockchainActivityBalanceChange[],
  sender: string
): ClassifiedContractCall {
  if (classified.protocol !== undefined || classified.action !== 'contract-execution') {
    return classified;
  }
  if (functionName !== sip10TransferFunctionName) return classified;
  const sip10Changes = balanceChanges.filter(change => change.asset.protocol === 'sip10');
  if (sip10Changes.length !== 1) return classified;
  return sip10Changes[0].direction === 'sent'
    ? { action: 'send' }
    : { action: 'receive', counterparty: sender };
}

// /balance-changes returns stx + ft + nft rows mixed; only ft rows are consumed here
// (stx arrives inline on the transactions response, nft handling is deferred).
export type FtBalanceChangeRow = HiroBalanceChangeResultItem & {
  readonly asset: { readonly type: 'ft'; readonly identifier: string };
};

export function isFtBalanceChangeRow(row: HiroBalanceChangeResultItem): row is FtBalanceChangeRow {
  return row.asset.type === 'ft';
}

// Superset pre-filter from the raw affected_balances flags: false means the tx certainly
// does not touch the asset; true still needs the post-mapping balance-change check.
export function mayTouchStacksAsset(item: ActivitySourceItem, assetId: CryptoAssetId): boolean {
  if (item.chain !== 'stacks') return false;
  if (assetId.protocol === 'nativeStx') return item.raw.affected_balances.stx;
  return item.raw.affected_balances.ft;
}

export function toStacksSourceItem(
  result: HiroPrincipalTransactionsResultItem
): ActivitySourceItem {
  return {
    txid: result.transaction.tx_id,
    chain: 'stacks',
    timestamp: result.transaction.block.time,
    raw: result,
  };
}

export function groupFtChangesByTxId(
  changes: readonly ({
    readonly txId: string;
    readonly change: BlockchainActivityBalanceChange;
  } | null)[]
): Map<string, BlockchainActivityBalanceChange[]> {
  return new Map(
    pipe(
      changes,
      filter(isNonNull),
      groupBy(entry => entry.txId),
      mapValues(group => group.map(entry => entry.change)),
      entries()
    )
  );
}

export function buildPendingStacksActivity(
  tx: StacksTx,
  stxAddress: string,
  classified?: ClassifiedContractCall
): BlockchainActivity | null {
  const initiatedByUser = tx.sender_address === stxAddress;
  // A sponsored tx's fee is paid by the sponsor, not the sender — attach no fee then.
  const paidFee = initiatedByUser && !tx.sponsored;
  const common = {
    timestamp: 'receipt_time' in tx ? tx.receipt_time : 0,
    txid: tx.tx_id,
    status: 'pending' as const,
    initiatedByUser,
    ...(paidFee ? { fee: createMoney(initBigNumber(tx.fee_rate), 'STX') } : {}),
  };

  switch (tx.tx_type) {
    case 'token_transfer': {
      const stxChange = buildStxBalanceChange(
        initiatedByUser ? `-${tx.token_transfer.amount}` : tx.token_transfer.amount
      );
      return buildStacksActivity({
        common,
        core: {
          kind: 'token_transfer',
          recipient: tx.token_transfer.recipient_address,
          sender: tx.sender_address,
        },
        action: initiatedByUser ? 'send' : 'receive',
        balanceChanges: stxChange === null ? [] : [stxChange],
      });
    }
    case 'smart_contract':
      return buildStacksActivity({
        common,
        core: { kind: 'smart_contract', contractId: tx.smart_contract.contract_id },
        action: 'contract-deploy',
        balanceChanges: [],
      });
    case 'contract_call': {
      const { action, protocol, protocolName } = classified ?? { action: 'contract-execution' };
      return buildStacksActivity({
        common,
        core: {
          kind: 'contract_call',
          contractId: tx.contract_call.contract_id,
          functionName: tx.contract_call.function_name,
        },
        action,
        protocol,
        protocolName,
        balanceChanges: [],
      });
    }
    default:
      return null;
  }
}

export function buildConfirmedStacksActivity(
  result: HiroPrincipalTransactionsResultItem,
  ftChanges: BlockchainActivityBalanceChange[],
  classified?: ClassifiedContractCall
): BlockchainActivity | null {
  if (!isStacksActivityResultItem(result)) return null;
  const tx = result.transaction;
  const initiatedByUser = result.involvement === 'sender';
  // v3's balance_changes.stx.net is fee-inclusive for the fee payer, so the fee is netted
  // back out — but only when this account actually paid it: a sponsored tx's fee comes out
  // of the sponsor's balance, so the sender's net already excludes it. An account whose
  // involvement is 'sponsor' IS that fee payer for someone else's tx.
  const paidFee = (initiatedByUser && tx.sponsor === null) || result.involvement === 'sponsor';
  const stxNet = paidFee
    ? initBigNumber(result.balance_changes.stx.net).plus(initBigNumber(tx.fee_rate)).toString()
    : result.balance_changes.stx.net;
  const stxChange = buildStxBalanceChange(stxNet);
  const balanceChanges = [...(stxChange === null ? [] : [stxChange]), ...ftChanges];
  const common = {
    timestamp: tx.block.time,
    txid: tx.tx_id,
    blockHeight: tx.block.height,
    status: mapStacksActivityStatus(tx.status),
    initiatedByUser,
    ...(paidFee ? { fee: createMoney(initBigNumber(tx.fee_rate), 'STX') } : {}),
  };

  switch (tx.type) {
    case 'token_transfer':
      return buildStacksActivity({
        common,
        core: {
          kind: 'token_transfer',
          recipient: tx.token_transfer.recipient,
          sender: tx.sender.address,
        },
        action: initiatedByUser ? 'send' : 'receive',
        balanceChanges,
      });
    case 'smart_contract':
      return buildStacksActivity({
        common,
        core: { kind: 'smart_contract', contractId: tx.smart_contract.contract_id },
        action: 'contract-deploy',
        balanceChanges,
      });
    case 'contract_call': {
      const { action, protocol, protocolName, counterparty } = reclassifySip10Transfer(
        classified ?? { action: 'contract-execution' },
        tx.contract_call.function_name,
        balanceChanges,
        tx.sender.address
      );
      return buildStacksActivity({
        common,
        core: {
          kind: 'contract_call',
          contractId: tx.contract_call.contract_id,
          functionName: tx.contract_call.function_name,
        },
        action,
        protocol,
        protocolName,
        counterparty,
        balanceChanges,
      });
    }
    default:
      return assertUnreachable(tx);
  }
}

function mapStacksTxActivityStatus(tx: StacksTx): OnChainActivityStatus {
  if (isMempoolTx(tx)) return 'pending';
  return tx.tx_status === 'success' ? 'success' : 'failed';
}

// Single-tx sibling of buildPendingStacksActivity reading the v1 tx shape from get-tx-by-id.
export function buildOnchainStacksActivity(
  tx: StacksTx,
  stxAddress: string,
  balanceChanges: { stxNet: string; ftChanges: BlockchainActivityBalanceChange[] },
  classified?: ClassifiedContractCall
): BlockchainActivity | null {
  const initiatedByUser = tx.sender_address === stxAddress;
  const paidFee = initiatedByUser && !tx.sponsored;
  const blockHeight = mapStacksTxBlockHeight(tx);
  const status = mapStacksTxActivityStatus(tx);
  const common = {
    timestamp: mapStacksTxBlockTime(tx),
    txid: tx.tx_id,
    status,
    initiatedByUser,
    ...(blockHeight !== undefined ? { blockHeight } : {}),
    ...(paidFee ? { fee: createMoney(initBigNumber(tx.fee_rate), 'STX') } : {}),
  };
  const netStxWithFee = paidFee
    ? initBigNumber(balanceChanges.stxNet).plus(initBigNumber(tx.fee_rate)).toString()
    : balanceChanges.stxNet;
  const hasAssetChange =
    !initBigNumber(balanceChanges.stxNet).isZero() || balanceChanges.ftChanges.length > 0;

  switch (tx.tx_type) {
    case 'token_transfer': {
      const isRecipient = tx.token_transfer.recipient_address === stxAddress;
      if (!initiatedByUser && !isRecipient) return null;
      const stxChange =
        status === 'failed'
          ? null
          : buildStxBalanceChange(
              initiatedByUser ? `-${tx.token_transfer.amount}` : tx.token_transfer.amount
            );
      return buildStacksActivity({
        common,
        core: {
          kind: 'token_transfer',
          recipient: tx.token_transfer.recipient_address,
          sender: tx.sender_address,
        },
        action: initiatedByUser ? 'send' : 'receive',
        balanceChanges: stxChange === null ? [] : [stxChange],
      });
    }
    case 'smart_contract': {
      if (!initiatedByUser && !hasAssetChange) return null;
      const stxChange = buildStxBalanceChange(netStxWithFee);
      return buildStacksActivity({
        common,
        core: { kind: 'smart_contract', contractId: tx.smart_contract.contract_id },
        action: 'contract-deploy',
        balanceChanges: [...(stxChange === null ? [] : [stxChange]), ...balanceChanges.ftChanges],
      });
    }
    case 'contract_call': {
      if (!initiatedByUser && !hasAssetChange) return null;
      const stxChange = buildStxBalanceChange(netStxWithFee);
      const allChanges = [...(stxChange === null ? [] : [stxChange]), ...balanceChanges.ftChanges];
      const { action, protocol, protocolName, counterparty } = reclassifySip10Transfer(
        classified ?? { action: 'contract-execution' },
        tx.contract_call.function_name,
        allChanges,
        tx.sender_address
      );
      return buildStacksActivity({
        common,
        core: {
          kind: 'contract_call',
          contractId: tx.contract_call.contract_id,
          functionName: tx.contract_call.function_name,
        },
        action,
        protocol,
        protocolName,
        counterparty,
        balanceChanges: allChanges,
      });
    }
    default:
      return null;
  }
}
