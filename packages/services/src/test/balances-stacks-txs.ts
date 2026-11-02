import type {
  MempoolContractCallTransaction,
  MempoolTokenTransferTransaction,
} from '@stacks/stacks-blockchain-api-types';

function createBalancesMempoolFields() {
  return {
    tx_id: '',
    nonce: 0,
    fee_rate: '0',
    sender_address: '',
    sponsored: false,
    post_condition_mode: 'deny' as const,
    post_conditions: [],
    anchor_mode: 'any' as const,
    tx_status: 'pending' as const,
    receipt_time: 0,
    receipt_time_iso: '',
  };
}

export function createBalancesTokenTransferTx(
  overrides: Partial<MempoolTokenTransferTransaction> = {}
): MempoolTokenTransferTransaction {
  return {
    ...createBalancesMempoolFields(),
    tx_type: 'token_transfer',
    token_transfer: { recipient_address: '', amount: '0', memo: '' },
    ...overrides,
  };
}

export function createBalancesContractCallTx(
  overrides: Partial<MempoolContractCallTransaction> = {}
): MempoolContractCallTransaction {
  return {
    ...createBalancesMempoolFields(),
    tx_type: 'contract_call',
    contract_call: { contract_id: '', function_name: '', function_signature: '' },
    ...overrides,
  };
}
