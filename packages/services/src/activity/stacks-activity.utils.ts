import { stxAsset } from '@leather.io/constants';
import type {
  BlockchainActivity,
  BlockchainActivityBalanceChange,
  Money,
  OnChainActivityStatus,
  StacksProtocolAction,
  StacksProtocolId,
} from '@leather.io/models';
import { assertUnreachable, createMoney, initBigNumber } from '@leather.io/utils';

import type {
  HiroPrincipalTransaction,
  HiroPrincipalTransactionsResultItem,
  HiroPrincipalTxStatus,
} from '../infrastructure/api/hiro/hiro-stacks-api.types';

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
  balanceChanges,
}: {
  common: StacksActivityCommon;
  core: StacksTxCore;
  action: StacksProtocolAction;
  protocol?: StacksProtocolId;
  balanceChanges: BlockchainActivityBalanceChange[];
}): BlockchainActivity {
  const base = {
    ...common,
    chain: 'stacks' as const,
    action,
    balanceChanges,
    ...(protocol ? { protocol } : {}),
  };
  switch (core.kind) {
    case 'token_transfer':
      return { ...base, counterparty: common.initiatedByUser ? core.recipient : core.sender };
    case 'smart_contract':
      return { ...base, contract: { type: 'deploy', contractId: core.contractId } };
    case 'contract_call':
      return {
        ...base,
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

interface ClassifiedContractCall {
  readonly action: StacksProtocolAction;
  readonly protocol?: StacksProtocolId;
}

export function reclassifySip10Transfer(
  classified: ClassifiedContractCall,
  functionName: string,
  balanceChanges: BlockchainActivityBalanceChange[]
): ClassifiedContractCall {
  if (classified.protocol !== undefined || classified.action !== 'contract-execution') {
    return classified;
  }
  if (functionName !== sip10TransferFunctionName) return classified;
  const sip10Changes = balanceChanges.filter(change => change.asset.protocol === 'sip10');
  if (sip10Changes.length !== 1) return classified;
  return { action: sip10Changes[0].direction === 'sent' ? 'send' : 'receive' };
}
