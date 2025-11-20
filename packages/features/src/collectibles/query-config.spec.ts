import { describe, expect, it, vi } from 'vitest';

import type { AccountAddresses } from '@leather.io/models';

import { getAccountCollectiblesQueryKey } from './query-config';

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

describe(getAccountCollectiblesQueryKey.name, () => {
  it('creates deterministic keys from account identifiers', () => {
    expect(getAccountCollectiblesQueryKey(account)).toEqual([
      'fp',
      1,
      'tr',
      'nw',
      'bc1p123',
      'bc1p456',
      'SP123',
    ]);
  });
});
