import { MempoolTransaction } from '@stacks/stacks-blockchain-api-types';
import { UseQueryResult } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import { useGetTransactionByIdListQuery } from '@leather.io/query';

import { useStacksPendingTransactions } from './use-stacks-pending-transactions';

vi.mock('@leather.io/query', () => ({
  useGetTransactionByIdListQuery: vi.fn(),
  useStacksClient: vi.fn(),
}));

describe(useStacksPendingTransactions.name, () => {
  const mockAddresses = ['ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'];
  const mockPendingTx: MempoolTransaction = {
    tx_id: '0x123',
    tx_status: 'pending',
    sender_address: mockAddresses[0] as string,
    nonce: 0,
    token_transfer: {
      recipient_address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      amount: '100',
      memo: '0x00000000000000000000000000000000000000000000000000000000000000000000',
    },
    fee_rate: '100',
    sponsored: false,
    post_condition_mode: 'allow',
    post_conditions: [],
    anchor_mode: 'any',
    receipt_time: 0,
    receipt_time_iso: '',
    tx_type: 'token_transfer',
  };

  it('returns pending transactions', () => {
    vi.mocked(useGetTransactionByIdListQuery).mockReturnValue([
      {
        data: mockPendingTx,
      },
    ] as UseQueryResult<MempoolTransaction, Error>[]);

    const result = useStacksPendingTransactions(mockAddresses);

    expect(result.transactions).toEqual([mockPendingTx]);
  });

  //   it('filters out non-pending transactions', () => {
  //     const nonPendingTx = { ...mockPendingTx, tx_status: 'success' as const };
  //     vi.mocked(useGetTransactionByIdListQuery).mockReturnValue([
  //       { data: nonPendingTx },
  //     ] as UseQueryResult<MempoolTransaction, Error>[]);

  //     const result = useStacksPendingTransactions(mockAddresses);

  //     expect(result.transactions).toEqual([]);
  //   });

  //   it('filters out undefined transactions', () => {
  //     vi.mocked(useGetTransactionByIdListQuery).mockReturnValue([{ data: undefined }]);

  //     const result = useStacksPendingTransactions(mockAddresses);

  //     expect(result.transactions).toEqual([]);
  //   });

  //   it('caches dropped transactions', () => {
  //     const droppedTx = { ...mockPendingTx, tx_status: 'success' as const };
  //     vi.mocked(useGetTransactionByIdListQuery).mockReturnValue([{ data: droppedTx }]);

  //     // First call caches the dropped tx
  //     useStacksPendingTransactions(mockAddresses);

  //     // Second call with same tx should return empty array due to cache
  //     vi.mocked(useGetTransactionByIdListQuery).mockReturnValue([{ data: droppedTx }]);
  //     const result = useStacksPendingTransactions(mockAddresses);

  //     expect(result.transactions).toEqual([]);
  //   });
});
