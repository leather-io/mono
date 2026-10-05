import type { MempoolTransaction, Transaction } from '@stacks/stacks-blockchain-api-types';

export type StacksTx = MempoolTransaction | Transaction;
export type StacksTxStatus = 'failed' | 'pending' | 'success';

export interface StacksTransactionPrincipal {
  address: string;
  nonce: number;
}

export interface StacksTransactionBlock {
  height: number;
  hash: string;
  index_hash: string;
  time: number;
  tx_index: number;
}

export interface StacksTransactionBitcoinBlock {
  height: number;
  time: number;
}

export interface StacksTransactionDecodedValue {
  hex: string;
  repr: string;
}

export interface StacksTransactionExecutionCost {
  read_count: number;
  read_length: number;
  runtime: number;
  write_count: number;
  write_length: number;
}

export type StacksConfirmedTransactionStatus =
  | 'success'
  | 'abort_by_response'
  | 'abort_by_post_condition'
  | 'problematic_skipped';

export type StacksMempoolTransactionStatus =
  | 'pending'
  | 'dropped_replace_by_fee'
  | 'dropped_replace_across_fork'
  | 'dropped_too_expensive'
  | 'dropped_stale_garbage_collect'
  | 'dropped_problematic';

export interface StacksTokenTransferTransactionPayload {
  type: 'token_transfer';
  token_transfer: {
    recipient: string;
    amount: string;
    memo: StacksTransactionDecodedValue | null;
  };
}

export interface StacksSmartContractTransactionPayload {
  type: 'smart_contract';
  smart_contract: {
    contract_id: string;
    clarity_version: number | null;
  };
}

export interface StacksContractCallTransactionPayload {
  type: 'contract_call';
  contract_call: {
    contract_id: string;
    function_name: string;
  };
}

export interface StacksPoisonMicroblockTransactionPayload {
  type: 'poison_microblock';
}

export interface StacksConfirmedTenureChangeTransactionPayload {
  type: 'tenure_change';
  tenure_change: {
    tenure_consensus_hash: string;
    prev_tenure_consensus_hash: string;
    burn_view_consensus_hash: string;
    previous_tenure_end: string;
    previous_tenure_blocks: number;
    cause:
      | 'block_found'
      | 'extended'
      | 'extended_runtime'
      | 'extended_read_count'
      | 'extended_read_length'
      | 'extended_write_count'
      | 'extended_write_length';
    pubkey_hash: string;
  };
}

export interface StacksConfirmedCoinbaseTransactionPayload {
  type: 'coinbase';
  coinbase: {
    payload: string;
    alt_recipient: string | null;
    vrf_proof: string | null;
  };
}

export interface StacksMempoolTenureChangeTransactionPayload {
  type: 'tenure_change';
}

export interface StacksMempoolCoinbaseTransactionPayload {
  type: 'coinbase';
}

export interface StacksConfirmedTransactionBase {
  tx_id: string;
  sender: StacksTransactionPrincipal;
  sponsor: StacksTransactionPrincipal | null;
  fee_rate: string;
  block: StacksTransactionBlock;
  bitcoin_block: StacksTransactionBitcoinBlock;
  status: StacksConfirmedTransactionStatus;
  parent_block: {
    hash: string;
    index_hash: string;
  };
  event_count: number;
  execution_cost: StacksTransactionExecutionCost;
  vm_error: string | null;
}

export interface StacksMempoolTransactionBase {
  tx_id: string;
  sender: StacksTransactionPrincipal;
  sponsor: StacksTransactionPrincipal | null;
  fee_rate: string;
  receipt_time: number;
  receipt_block_height: number;
  status: StacksMempoolTransactionStatus;
  replaced_by_tx_id: string | null;
}

export type StacksConfirmedTransaction = StacksConfirmedTransactionBase &
  (
    | StacksTokenTransferTransactionPayload
    | StacksSmartContractTransactionPayload
    | StacksContractCallTransactionPayload
    | StacksPoisonMicroblockTransactionPayload
    | StacksConfirmedTenureChangeTransactionPayload
    | StacksConfirmedCoinbaseTransactionPayload
  );

export type StacksMempoolTransaction = StacksMempoolTransactionBase &
  (
    | StacksTokenTransferTransactionPayload
    | StacksSmartContractTransactionPayload
    | StacksContractCallTransactionPayload
    | StacksPoisonMicroblockTransactionPayload
    | StacksMempoolTenureChangeTransactionPayload
    | StacksMempoolCoinbaseTransactionPayload
  );

export type StacksTransaction = StacksConfirmedTransaction | StacksMempoolTransaction;

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
