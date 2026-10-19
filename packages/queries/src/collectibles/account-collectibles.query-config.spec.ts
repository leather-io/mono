import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import { type AccountAddresses, defaultCurrentNetwork } from '@leather.io/models';
import type { AccountRequest, UserSettings } from '@leather.io/services';

import {
  createAccountCollectiblesQueryConfig,
  createAccountCollectiblesQueryKey,
} from './account-collectibles.query-config';

const mockGetAccountCollectibles = vi.fn();

vi.mock('@leather.io/services', () => ({
  getCollectiblesService: () => ({
    getAccountCollectibles: mockGetAccountCollectibles,
  }),
}));

const settings: UserSettings = {
  network: defaultCurrentNetwork,
  quoteCurrency: 'USD',
  assetVisibility: {},
};

const account: AccountAddresses = {
  id: { fingerprint: 'fp', accountIndex: 1 },
  bitcoin: {
    type: 'hd',
    taprootDescriptor: 'tr',
    nativeSegwitDescriptor: 'nw',
    zeroIndexNativeSegwitPayerAddress: 'bc1p123',
    zeroIndexTaprootPayerAddress: 'bc1p456',
  },
  stacks: {
    stxAddress: 'SP123',
  },
};

const request: AccountRequest = { account };

describe(createAccountCollectiblesQueryKey.name, () => {
  it('creates deterministic keys from account identifiers', () => {
    expect(createAccountCollectiblesQueryKey(request, settings)).toMatchSnapshot();
  });
});

describe(createAccountCollectiblesQueryConfig.name, () => {
  it('passes query key context through to the query key', () => {
    const config = createAccountCollectiblesQueryConfig(request, settings, ['test']);

    expect(config.queryKey?.at(-1)).toBe('test');
  });

  it('invokes collectibles service with provided account', async () => {
    mockGetAccountCollectibles.mockResolvedValueOnce([{ protocol: 'sip9' }]);

    const config = createAccountCollectiblesQueryConfig(request, settings);
    expect(config.queryFn).toBeDefined();

    const { signal } = new AbortController();
    await config.queryFn({
      client: new QueryClient(),
      queryKey: config.queryKey,
      signal,
      meta: undefined,
    });
    expect(mockGetAccountCollectibles).toHaveBeenCalledWith(request, signal);
  });
});
