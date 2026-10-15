import type { OperationResponse } from '@stacks/blockchain-api-client';
import type { MempoolTransaction, Transaction } from '@stacks/stacks-blockchain-api-types';

export type StacksTx = MempoolTransaction | Transaction;
export type StacksTxStatus = 'failed' | 'pending' | 'success';

export type StacksTransaction = OperationResponse['get_transaction'];
export type StacksMempoolTransaction = Extract<StacksTransaction, { receipt_time: number }>;
export type StacksConfirmedTransaction = Exclude<StacksTransaction, StacksMempoolTransaction>;
export type StacksMempoolTransactionStatus = StacksMempoolTransaction['status'];
export type StacksConfirmedTransactionStatus = StacksConfirmedTransaction['status'];

export function isStacksMempoolTransaction(tx: StacksTransaction): tx is StacksMempoolTransaction {
  return 'receipt_time' in tx;
}

export interface StxTransfer {
  amount: string;
  sender?: string;
  recipient?: string;
}

export interface FtTransfer {
  asset_identifier: string;
  amount: string;
  sender?: string;
  recipient?: string;
}
