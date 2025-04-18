import {
  ContractCallTransaction,
  MempoolContractCallTransaction,
  MempoolTransaction,
  Transaction,
} from '@stacks/stacks-blockchain-api-types';

export function isMempoolContractCallTransaction(
  t: MempoolTransaction
): t is MempoolContractCallTransaction {
  return t.tx_type === 'contract_call';
}
export function isContractCallTransaction(t: Transaction): t is ContractCallTransaction {
  return t.tx_type === 'contract_call';
}
