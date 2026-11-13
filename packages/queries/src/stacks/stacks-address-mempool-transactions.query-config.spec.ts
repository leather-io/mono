import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import { defaultCurrentNetwork } from '@leather.io/models';
import type { UserSettings } from '@leather.io/services';

import { createStacksAddressMempoolTransactionsQueryConfig } from './stacks-address-mempool-transactions.query-config';

const mockGetPrincipalMempoolTransactions = vi.fn();

vi.mock('@leather.io/services', () => ({
  getHiroStacksApiClient: () => ({
    getPrincipalMempoolTransactions: mockGetPrincipalMempoolTransactions,
  }),
}));

const settings: UserSettings = {
  network: defaultCurrentNetwork,
  quoteCurrency: 'USD',
  assetVisibility: {},
};

const address = 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE';

describe(createStacksAddressMempoolTransactionsQueryConfig.name, () => {
  it('is disabled without an address', () => {
    expect(createStacksAddressMempoolTransactionsQueryConfig('', settings).enabled).toBe(false);
  });

  it('fetches the first page of the principal mempool transactions', async () => {
    const response = { total: 0, limit: 50, cursor: {}, results: [] };
    mockGetPrincipalMempoolTransactions.mockResolvedValueOnce(response);

    const config = createStacksAddressMempoolTransactionsQueryConfig(address, settings);
    const { signal } = new AbortController();
    const result = await config.queryFn({
      client: new QueryClient(),
      queryKey: config.queryKey,
      signal,
      meta: undefined,
    });

    expect(result).toBe(response);
    expect(mockGetPrincipalMempoolTransactions).toHaveBeenCalledWith(address, {}, { signal });
  });
});
