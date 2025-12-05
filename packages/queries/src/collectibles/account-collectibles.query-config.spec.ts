import { describe, expect, it, vi } from 'vitest';

import type { AccountAddresses } from '@leather.io/models';

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

const account = {
  id: { fingerprint: 'fp', accountIndex: 1 },
  bitcoin: {
    taprootDescriptor: 'tr',
    nativeSegwitDescriptor: 'nw',
    zeroIndexNativeSegwitPayerAddress: 'bc1p123',
    zeroIndexTaprootPayerAddress: 'bc1p456',
  },
  stacks: {
    stxAddress: 'SP123',
  },
} as AccountAddresses;

describe(createAccountCollectiblesQueryKey.name, () => {
  it('creates deterministic keys from account identifiers', () => {
    expect(createAccountCollectiblesQueryKey(account)).toMatchSnapshot();
  });
});

describe(createAccountCollectiblesQueryConfig.name, () => {
  it('passes query key context through to the query key', () => {
    const config = createAccountCollectiblesQueryConfig(account, {
      queryKeyContext: ['test'],
    });

    expect(config.queryKey?.at(-1)).toBe('test');
  });

  it('invokes collectibles service with provided account', async () => {
    mockGetAccountCollectibles.mockResolvedValueOnce([{ protocol: 'inscription' }]);

    const config = createAccountCollectiblesQueryConfig(account);
    expect(config.queryFn).toBeDefined();

    await config.queryFn!({ signal: undefined } as any);
    expect(mockGetAccountCollectibles).toHaveBeenCalledWith({ account }, undefined);
  });
});

