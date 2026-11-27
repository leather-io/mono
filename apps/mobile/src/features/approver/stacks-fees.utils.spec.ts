import { describe, expect, test } from 'vitest';

import { FeeTypes, type StacksTransactionFees } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { getStacksFeeType, getStacksFeesByType } from './stacks-fees.utils';

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

describe(getStacksFeeType.name, () => {
  test('is custom while the quotes are not loaded', () => {
    expect(getStacksFeeType(createMoney(2000, 'STX'), undefined)).toBe(FeeTypes.Custom);
  });

  test('matches each tier by its exact fee amount', () => {
    expect(getStacksFeeType(createMoney(1000, 'STX'), stacksFees)).toBe(FeeTypes.Low);
    expect(getStacksFeeType(createMoney(2000, 'STX'), stacksFees)).toBe(FeeTypes.Middle);
    expect(getStacksFeeType(createMoney(3000, 'STX'), stacksFees)).toBe(FeeTypes.High);
  });

  test('is custom when the fee matches no tier', () => {
    expect(getStacksFeeType(createMoney(2500, 'STX'), stacksFees)).toBe(FeeTypes.Custom);
  });
});

describe(getStacksFeesByType.name, () => {
  test('maps the service tiers onto the fee types', () => {
    const fees = getStacksFeesByType(stacksFees);

    expect(fees[FeeTypes.Low].amount.toString()).toEqual('1000');
    expect(fees[FeeTypes.Middle].amount.toString()).toEqual('2000');
    expect(fees[FeeTypes.High].amount.toString()).toEqual('3000');
    expect(fees[FeeTypes.Custom].amount.toString()).toEqual('0');
    expect(fees[FeeTypes.Unknown].amount.toString()).toEqual('0');
  });

  test('falls back to zero fees while the quotes are not loaded', () => {
    const fees = getStacksFeesByType(undefined);

    expect(fees[FeeTypes.Low].amount.toString()).toEqual('0');
    expect(fees[FeeTypes.Middle].amount.toString()).toEqual('0');
    expect(fees[FeeTypes.High].amount.toString()).toEqual('0');
    expect(fees[FeeTypes.Middle].symbol).toEqual('STX');
  });
});
