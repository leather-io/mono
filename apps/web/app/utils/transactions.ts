import { type MempoolTransaction, type Transaction } from '@stacks/stacks-blockchain-api-types';

export function isMempoolContractCallTransaction(t: MempoolTransaction) {
  return t.tx_type === 'contract_call';
}
export function isContractCallTransaction(t: Transaction) {
  return t.tx_type === 'contract_call';
}
