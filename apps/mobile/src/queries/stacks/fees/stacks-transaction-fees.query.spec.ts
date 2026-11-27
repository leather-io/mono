import { renderHookWithProviders } from '@/tests/test-utils';
import { type StacksTransactionWire, makeUnsignedSTXTokenTransfer } from '@stacks/transactions';
import { waitFor } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { type StacksTransactionFees, defaultNetworksKeyedById } from '@leather.io/models';
import { createStacksTransactionFeesQueryConfig } from '@leather.io/queries';
import { type UserSettings } from '@leather.io/services';
import { createMoney } from '@leather.io/utils';

import { useStacksTransactionFees } from './stacks-transaction-fees.query';

const settings: UserSettings = {
  network: defaultNetworksKeyedById.mainnet,
  quoteCurrency: 'USD',
  assetVisibility: {},
};

vi.mock('@/hooks/use-user-settings', () => ({
  useUserSettings: () => settings,
}));

vi.mock('@leather.io/queries', () => ({
  createStacksTransactionFeesQueryConfig: vi.fn(),
}));

function createQuote(fee: number) {
  return {
    type: 'stacksFeeRate',
    value: createMoney(fee, 'STX'),
    rate: 1,
    rateUnit: 'µSTX/byte',
    estimatedTxSize: fee,
    sizeUnit: 'byte',
  } as const;
}

const stacksFees: StacksTransactionFees = {
  chain: 'stacks',
  minimumFee: createMoney(100, 'STX'),
  highFeeThreshold: createMoney(1000000, 'STX'),
  options: {
    low: createQuote(1000),
    standard: createQuote(2000),
    high: createQuote(3000),
  },
};

describe(useStacksTransactionFees.name, () => {
  let unsignedTx: StacksTransactionWire;

  beforeAll(async () => {
    unsignedTx = await makeUnsignedSTXTokenTransfer({
      publicKey: '0250863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352',
      recipient: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
      amount: 1,
      fee: 0,
      nonce: 0,
      network: 'testnet',
    });
  });

  beforeEach(() => {
    vi.mocked(createStacksTransactionFeesQueryConfig).mockReset();
    vi.mocked(createStacksTransactionFeesQueryConfig).mockReturnValue({
      queryKey: ['stacks-transaction-fees-service--get-stacks-transaction-fees'],
      queryFn: () => Promise.resolve(stacksFees),
      refetchOnWindowFocus: false,
      refetchInterval: 0,
      refetchOnMount: true,
    });
  });

  test('stays idle without an unsigned transaction', () => {
    const { result } = renderHookWithProviders(() => useStacksTransactionFees(undefined));

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
    expect(createStacksTransactionFeesQueryConfig).not.toHaveBeenCalled();
  });

  test('loads the fee quotes for the unsigned transaction through the shared config', async () => {
    const { result } = renderHookWithProviders(() => useStacksTransactionFees(unsignedTx));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(createStacksTransactionFeesQueryConfig).toHaveBeenCalledWith(unsignedTx, settings);
    expect(result.current.data).toEqual(stacksFees);
  });
});
