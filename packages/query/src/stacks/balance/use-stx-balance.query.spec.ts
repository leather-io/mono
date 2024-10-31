import { describe, expect, it, vi } from 'vitest';

import { createMoney } from '@leather.io/utils';

import { useStxBalanceQuery } from './use-stx-balance.query';

vi.mock('../stacks-client', () => ({
  useStacksClient: vi.fn(),
}));

vi.mock('../../leather-query-provider', () => ({
  useCurrentNetworkState: vi.fn().mockReturnValue({
    chain: {
      stacks: {
        url: 'https://api.mainnet.hiro.so',
      },
    },
  }),
}));

// Mock the query hook response
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: createMoney(1000000, 'STX'),
    isLoading: false,
    error: null,
  }),
}));

describe('useStxBalanceQuery', () => {
  const mockAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const mockBalance = {
    balance: '1000',
    total_sent: '100',
    total_received: '1100',
    locked: '200',
    total_fees_sent: '50',
    total_miner_rewards_received: '0',
  };

  const mockClient = {
    accountsApi: {
      getAccountBalance: vi.fn().mockResolvedValue(mockBalance),
    },
  };

  it('should fetch and return STX balance', async () => {
    const result = useStxBalanceQuery(mockAddress);

    expect(result.data).toEqual(createMoney(1000000, 'STX'));
  });

  it('should handle error state', async () => {
    const error = new Error('Failed to fetch balance');
    mockClient.accountsApi.getAccountBalance.mockRejectedValueOnce(error);

    const result = useStxBalanceQuery(mockAddress);

    expect(result.error).toBeDefined();
  });
});
