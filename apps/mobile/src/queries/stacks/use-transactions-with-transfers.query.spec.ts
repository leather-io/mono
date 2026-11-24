// TODO: ENG-8 replace this test with integration tests
import { describe, expect, it, vi } from 'vitest';

import { createStacksAddressTransactionsQueryConfig } from '@leather.io/queries';
import { type HiroPrincipalTransaction } from '@leather.io/services';

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
  const mockTransactions: HiroPrincipalTransaction[] = [
    {
      tx_id: '0x1234',
      sender: { address: 'SP123...', nonce: 0 },
      sponsor: null,
      fee_rate: '0',
      block: { height: 0, hash: '0x', index_hash: '0x', time: 0, tx_index: 0 },
      bitcoin_block: { height: 0, time: 0 },
      status: 'success',
      type: 'token_transfer',
      token_transfer: { recipient: 'SP123...', amount: '0', memo: null },
    },
  ];

  it.skip('returns combined results from all queries', () => {
    vi.mocked(createStacksAddressTransactionsQueryConfig).mockReturnValue({
      staleTime: 0,
      refetchInterval: 30000,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: true,
      enabled: true,
      queryKey: ['hiro-stacks-api-client--get-principal-transactions', mockAddress, 'mainnet'],
      queryFn: () => Promise.resolve(mockTransactions),
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
      queryKey: ['hiro-stacks-api-client--get-principal-transactions', mockAddress, 'mainnet'],
      queryFn: () => Promise.resolve(mockTransactions),
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
