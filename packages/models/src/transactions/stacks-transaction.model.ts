import type { MempoolTransaction, Transaction } from '@stacks/stacks-blockchain-api-types';

export type StacksTx = MempoolTransaction | Transaction;
export type StacksTxStatus = 'failed' | 'pending' | 'success';

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
