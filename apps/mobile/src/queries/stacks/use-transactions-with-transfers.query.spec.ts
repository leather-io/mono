// TODO: ENG-8 replace this test with integration tests
import { type AddressTransactionsWithTransfersListResponse } from '@stacks/stacks-blockchain-api-types';
import { describe, expect, it, vi } from 'vitest';

import { createStacksAddressTransactionsQueryConfig } from '@leather.io/queries';

import { useGetAccountTransactionsWithTransfersQueries } from './use-transactions-with-transfers.query';

vi.mock('@leather.io/queries', () => ({
  createStacksAddressTransactionsQueryConfig: vi.fn(),
}));

vi.mock('@/hooks/use-user-settings', () => ({
  useUserSettings: () => ({
    network: { id: 'mainnet', chain: { stacks: { url: 'https://test-api.com' } } },
    quoteCurrency: 'USD',
    assetVisibility: {},
  }),
}));

describe('useGetAccountTransactionsWithTransfersQueries', () => {
  const mockAddress = 'SP2417H88DQFN7FNDMSKM9N0B3Q6GNGEM40W7ZAZW';
  const mockTransactionData: AddressTransactionsWithTransfersListResponse = {
    results: [
      {
        tx: {
          tx_id: '0x1234',
          nonce: 0,
          fee_rate: '0',
          sender_address: 'SP123...',
          sponsored: false,
          post_condition_mode: 'deny',
          post_conditions: [],
          anchor_mode: 'any',
          block_hash: '0x',
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
          tx_result: { hex: '0x', repr: '' },
          event_count: 0,
          parent_block_hash: '0x',
          is_unanchored: false,
          microblock_hash: '0x',
          microblock_sequence: 0,
          microblock_canonical: true,
          execution_cost_read_count: 0,
          execution_cost_read_length: 0,
          execution_cost_runtime: 0,
          execution_cost_write_count: 0,
          execution_cost_write_length: 0,
          events: [],
          tx_type: 'token_transfer',
          token_transfer: { recipient_address: 'SP123...', amount: '0', memo: '' },
        },
        stx_sent: '0',
        stx_received: '0',
        stx_transfers: [],
      },
    ],
    limit: 10,
    offset: 0,
    total: 1,
  };

  it.skip('returns combined results from all queries', () => {
    vi.mocked(createStacksAddressTransactionsQueryConfig).mockReturnValue({
      staleTime: 0,
      refetchInterval: 30000,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: true,
      enabled: true,
      queryKey: ['hiro-stacks-api-client--get-address-transactions', mockAddress, 'mainnet'],
      queryFn: () => Promise.resolve(mockTransactionData.results),
    });

    const result = useGetAccountTransactionsWithTransfersQueries([mockAddress]);

    expect(result.queries).toBeDefined();
    expect(Array.isArray(result.totalData)).toBe(true);
    expect(typeof result.pending).toBe('boolean');
  });

  it.skip('combines data from multiple addresses', () => {
    const multipleAddresses = [
      'SP2417H88DQFN7FNDMSKM9N0B3Q6GNGEM40W7ZAZW',
      'SP3XD84X3PE79SHJAZCDW1V5E9EA8JSKRBPEKAEK7',
    ];

    vi.mocked(createStacksAddressTransactionsQueryConfig).mockReturnValue({
      staleTime: 0,
      refetchInterval: 30000,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: true,
      enabled: true,
      queryKey: ['hiro-stacks-api-client--get-address-transactions', mockAddress, 'mainnet'],
      queryFn: () => Promise.resolve(mockTransactionData.results),
    });

    const result = useGetAccountTransactionsWithTransfersQueries(multipleAddresses);

    expect(createStacksAddressTransactionsQueryConfig).toHaveBeenCalledTimes(2);
    expect(result.queries.length).toBe(2);
  });

  it.skip('handles empty addresses array', () => {
    const result = useGetAccountTransactionsWithTransfersQueries([]);

    expect(result.queries).toEqual([]);
    expect(result.totalData).toEqual([]);
    expect(result.pending).toBe(false);
  });
});
