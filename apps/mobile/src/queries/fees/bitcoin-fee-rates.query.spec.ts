import { renderHookWithProviders } from '@/tests/test-utils';
import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { defaultNetworksKeyedById } from '@leather.io/models';
import { createBitcoinFeeRatesQueryConfig } from '@leather.io/queries';
import { type UserSettings } from '@leather.io/services';

import { type BitcoinFeeRates, useBitcoinFeeRates } from './bitcoin-fee-rates.query';

const settings: UserSettings = {
  network: defaultNetworksKeyedById.mainnet,
  quoteCurrency: 'USD',
  assetVisibility: {},
};

vi.mock('@/hooks/use-user-settings', () => ({
  useUserSettings: () => settings,
}));

vi.mock('@leather.io/queries', () => ({
  createBitcoinFeeRatesQueryConfig: vi.fn(),
}));

const feeRates: BitcoinFeeRates = {
  low: { rate: 1 },
  standard: { rate: 2 },
  high: { rate: 3 },
};

describe(useBitcoinFeeRates.name, () => {
  beforeEach(() => {
    vi.mocked(createBitcoinFeeRatesQueryConfig).mockReset();
    vi.mocked(createBitcoinFeeRatesQueryConfig).mockReturnValue({
      queryKey: ['leather-api--bitcoin-fee-rates'],
      queryFn: () => Promise.resolve(feeRates),
      refetchInterval: 0,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    });
  });

  test('loads the tiered fee rates through the shared config', async () => {
    const { result } = renderHookWithProviders(() => useBitcoinFeeRates());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(createBitcoinFeeRatesQueryConfig).toHaveBeenCalledWith(settings);
    expect(result.current.data).toEqual(feeRates);
  });
});
