import { renderHookWithProviders } from '@/tests/test-utils';
import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { type BitcoinTransactionFees, defaultNetworksKeyedById } from '@leather.io/models';
import { createBitcoinTransactionFeesQueryConfig } from '@leather.io/queries';
import { type AccountRequest, type UserSettings } from '@leather.io/services';
import { createAccountAddresses, createMoney } from '@leather.io/utils';

import { useBitcoinTransactionFees } from './bitcoin-transaction-fees.query';

const settings: UserSettings = {
  network: defaultNetworksKeyedById.mainnet,
  quoteCurrency: 'USD',
  assetVisibility: {},
};

vi.mock('@/hooks/use-user-settings', () => ({
  useUserSettings: () => settings,
}));

vi.mock('@leather.io/queries', () => ({
  createBitcoinTransactionFeesQueryConfig: vi.fn(),
}));

function createQuote(fee: number, rate: number) {
  return {
    type: 'bitcoinFeeRate',
    value: createMoney(fee, 'BTC'),
    rate,
    rateUnit: 'sats/vB',
    estimatedTxSize: 140,
    sizeUnit: 'vB',
  } as const;
}

const bitcoinFees: BitcoinTransactionFees = {
  chain: 'bitcoin',
  options: {
    low: createQuote(140, 1),
    standard: createQuote(280, 2),
    high: createQuote(420, 3),
  },
};

const account: AccountRequest = {
  account: createAccountAddresses({ fingerprint: 'deadbeef', accountIndex: 0 }),
};
const recipients = [
  { address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', amount: createMoney(1000, 'BTC') },
];

describe(useBitcoinTransactionFees.name, () => {
  beforeEach(() => {
    vi.mocked(createBitcoinTransactionFeesQueryConfig).mockReset();
    vi.mocked(createBitcoinTransactionFeesQueryConfig).mockReturnValue({
      queryKey: ['bitcoin-transaction-fees-service--get-bitcoin-transaction-fees'],
      queryFn: () => Promise.resolve(bitcoinFees),
      refetchInterval: 0,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    });
  });

  test('stays idle when disabled', () => {
    const { result } = renderHookWithProviders(() =>
      useBitcoinTransactionFees({ account, recipients, enabled: false })
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });

  test('loads the per-transaction quotes through the shared config', async () => {
    const { result } = renderHookWithProviders(() =>
      useBitcoinTransactionFees({ account, recipients, isMaxSpend: true })
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(createBitcoinTransactionFeesQueryConfig).toHaveBeenCalledWith(
      { account, recipients, isMaxSpend: true },
      settings
    );
    expect(result.current.data).toEqual(bitcoinFees);
  });
});
