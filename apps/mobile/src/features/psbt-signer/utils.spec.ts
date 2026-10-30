import { describe, expect, test } from 'vitest';

import { type BitcoinTransactionFees, FeeTypes } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { getFeeType } from './utils';

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

describe(getFeeType.name, () => {
  test('is custom while the quotes are not loaded', () => {
    expect(getFeeType({ psbtFee: createMoney(280, 'BTC'), fees: undefined })).toBe(FeeTypes.Custom);
  });

  test('matches each tier by its exact fee amount', () => {
    expect(getFeeType({ psbtFee: createMoney(140, 'BTC'), fees: bitcoinFees })).toBe(FeeTypes.Low);
    expect(getFeeType({ psbtFee: createMoney(280, 'BTC'), fees: bitcoinFees })).toBe(
      FeeTypes.Middle
    );
    expect(getFeeType({ psbtFee: createMoney(420, 'BTC'), fees: bitcoinFees })).toBe(FeeTypes.High);
  });

  test('is custom when the psbt fee matches no tier', () => {
    expect(getFeeType({ psbtFee: createMoney(300, 'BTC'), fees: bitcoinFees })).toBe(
      FeeTypes.Custom
    );
  });
});
