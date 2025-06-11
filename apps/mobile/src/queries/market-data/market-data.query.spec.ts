import { describe, expect, it, vi } from 'vitest';

import { FungibleCryptoAsset } from '@leather.io/models';

import { createMarketDataQueryOptions } from './market-data.query';

const maxTimeMs = 2147483647;

// Mock the useSettings hook
vi.mock('@/store/settings/settings', () => ({
  useSettings: () => ({
    fiatCurrencyPreference: 'USD',
  }),
}));

describe('createMarketDataQueryOptions', () => {
  const options = createMarketDataQueryOptions({} as FungibleCryptoAsset, 'mainnet');
  it('should have valid cache times', () => {
    expect(options.gcTime).toBeGreaterThanOrEqual(0);
    expect(options.staleTime).toBeGreaterThanOrEqual(0);
    expect(options.gcTime).toBeLessThanOrEqual(maxTimeMs);
    expect(options.staleTime).toBeLessThanOrEqual(maxTimeMs);
  });
});
