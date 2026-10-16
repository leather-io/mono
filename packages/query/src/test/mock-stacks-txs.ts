import type {
  AbstractTransaction,
  AddressTransactionWithTransfers,
  AddressTransactionsWithTransfersListResponse,
  TokenTransferTransaction,
  Transaction,
} from '@stacks/stacks-blockchain-api-types';

export function createMockAbstractTransaction(
  overrides: Partial<AbstractTransaction> = {}
): AbstractTransaction {
  return {
    tx_id: '0x0',
    nonce: 0,
    fee_rate: '0',
    sender_address: '',
    sponsored: false,
    post_condition_mode: 'deny',
    post_conditions: [],
    anchor_mode: 'any',
    block_hash: '',
    block_height: 0,
    block_time: 0,
    block_time_iso: '',
    burn_block_height: 0,
    burn_block_time: 0,
    burn_block_time_iso: '',
    parent_burn_block_time: 0,
    parent_burn_block_time_iso: '',
    canonical: true,
    tx_index: 0,
    tx_status: 'success',
    tx_result: { hex: '', repr: '' },
    event_count: 0,
    parent_block_hash: '',
    is_unanchored: false,
    microblock_hash: '',
    microblock_sequence: 0,
    microblock_canonical: true,
    execution_cost_read_count: 0,
    execution_cost_read_length: 0,
    execution_cost_runtime: 0,
    execution_cost_write_count: 0,
    execution_cost_write_length: 0,
    events: [],
    ...overrides,
  };
}

export function createMockTokenTransferTransaction(
  overrides: Partial<AbstractTransaction> = {}
): TokenTransferTransaction {
  return {
    ...createMockAbstractTransaction(overrides),
    tx_type: 'token_transfer',
    token_transfer: { recipient_address: '', amount: '0', memo: '' },
  };
}

export function createMockTransactionsWithTransfersResponse(
  txs: Transaction[]
): AddressTransactionsWithTransfersListResponse {
  const results: AddressTransactionWithTransfers[] = txs.map(tx => ({
    tx,
    stx_sent: '0',
    stx_received: '0',
    stx_transfers: [],
  }));
  return { limit: txs.length, offset: 0, total: txs.length, results };
}
