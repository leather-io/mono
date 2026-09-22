import { describe, expect, test } from 'vitest';

import { createMoney } from '@leather.io/utils';

import { getCustomStacksFee, getStacksProposalFeeBalanceError } from './custom-stacks-fee';

const minimumFee = createMoney(345, 'STX');

describe(getCustomStacksFee.name, () => {
  test('accepts the exact multisig minimum without applying preset minimums', () => {
    expect(getCustomStacksFee('0.000345', minimumFee).fee?.amount.toFixed()).toBe('345');
  });

  test('rejects one microSTX below the multisig minimum', () => {
    expect(getCustomStacksFee('0.000344', minimumFee)).toEqual({
      error: 'Fee must be at least 0.000345 STX',
    });
  });

  test('allows fees above the high fee warning threshold', () => {
    expect(getCustomStacksFee('5.000001', minimumFee).fee?.amount.toFixed()).toBe('5000001');
  });

  test.each(['', '   '])('does not provide a fee for empty input %j', input => {
    expect(getCustomStacksFee(input, minimumFee)).toEqual({});
  });

  test.each(['0', '-1', 'NaN', 'Infinity', '1e2', '0x10', '1,2', '1.0000001', '.'])(
    'rejects invalid fee %j',
    input => {
      expect(getCustomStacksFee(input, minimumFee).error).toBeDefined();
      expect(getCustomStacksFee(input, minimumFee).fee).toBeUndefined();
    }
  );

  test('waits for the transaction minimum before allowing submission', () => {
    expect(getCustomStacksFee('1')).toEqual({});
  });

  test('revalidates when transaction size increases', () => {
    expect(getCustomStacksFee('0.000345', createMoney(400, 'STX')).fee).toBeUndefined();
  });

  test('preserves exact microSTX precision at the serialization limit', () => {
    expect(getCustomStacksFee('18446744073709.551615', minimumFee).fee?.amount.toFixed()).toBe(
      '18446744073709551615'
    );
    expect(getCustomStacksFee('18446744073709.551616', minimumFee).error).toBe('Fee is too large');
  });
});

describe(getStacksProposalFeeBalanceError.name, () => {
  const balance = createMoney(1000000, 'STX');

  test('reserves STX for both the transfer and its fee', () => {
    expect(getStacksProposalFeeBalanceError(minimumFee, balance, balance, false)).toBeDefined();
    expect(
      getStacksProposalFeeBalanceError(minimumFee, createMoney(999655, 'STX'), balance, false)
    ).toBeUndefined();
  });

  test('uses the STX balance to pay token transfer fees', () => {
    const tokenAmount = createMoney(100000000, 'TOKEN', 8);
    expect(
      getStacksProposalFeeBalanceError(minimumFee, tokenAmount, balance, true)
    ).toBeUndefined();
    expect(
      getStacksProposalFeeBalanceError(minimumFee, tokenAmount, createMoney(0, 'STX'), true)
    ).toBeDefined();
  });
});
