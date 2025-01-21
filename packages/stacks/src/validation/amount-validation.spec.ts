import { createMoney } from '@leather.io/utils';

import { isStxAmountValid, isStxBalanceSufficient } from './amount-validation';
import { StacksError } from './stacks-error';

describe('isStxAmountValid', () => {
  it('returns true for valid amount, balance, and fee', () => {
    const args = {
      amount: createMoney(1, 'STX'),
      availableBalance: createMoney(100, 'STX'),
      fee: createMoney(1, 'STX'),
    };
    expect(isStxAmountValid(args)).toBe(true);
  });

  it('throws an error for invalid amount', () => {
    const args = {
      amount: { amount: null },
      availableBalance: createMoney(100, 'STX'),
      fee: createMoney(1, 'STX'),
    };
    // @ts-expect-error - amount is null
    expect(() => isStxAmountValid(args)).toThrow(new StacksError('InvalidAmount'));
  });

  it('throws an error for unknown balance', () => {
    const args = {
      amount: createMoney(1, 'STX'),
      availableBalance: { amount: null },
      fee: createMoney(1, 'STX'),
    };
    // @ts-expect-error - availableBalance is null
    expect(() => isStxAmountValid(args)).toThrow(new StacksError('UnknownBalance'));
  });

  it('throws an error for unknown fee', () => {
    const args = {
      amount: createMoney(1, 'STX'),
      availableBalance: createMoney(100, 'STX'),
      fee: { amount: null },
    };
    // @ts-expect-error - fee is null
    expect(() => isStxAmountValid(args)).toThrow(new StacksError('UnknownFee'));
  });
});

describe('isStxBalanceSufficient', () => {
  it('returns true if the balance is sufficient', () => {
    const args = {
      amount: createMoney(1, 'STX'),
      availableBalance: createMoney(2, 'STX'),
      fee: createMoney(0.5, 'STX'),
    };
    expect(isStxBalanceSufficient(args)).toBe(true);
  });

  it('returns false if the balance is not sufficient', () => {
    const args = {
      amount: createMoney(2, 'STX'),
      availableBalance: createMoney(1, 'STX'),
      fee: createMoney(0.5, 'STX'),
    };
    expect(isStxBalanceSufficient(args)).toBe(false);
  });

  it('throws an error if the available balance is unknown', () => {
    const args = {
      amount: createMoney(1, 'STX'),
      availableBalance: { amount: null },
      fee: createMoney(0.5, 'STX'),
    };
    // @ts-expect-error - availableBalance is null
    expect(() => isStxBalanceSufficient(args)).toThrow('UnknownBalance');
  });

  it('throws an error if the fee is unknown', () => {
    const args = {
      amount: createMoney(1, 'STX'),
      availableBalance: createMoney(2, 'STX'),
      fee: { amount: null },
    };
    // @ts-expect-error - fee is null
    expect(() => isStxBalanceSufficient(args)).toThrow('UnknownFee');
  });

  it('throws an error if the fee is not finite', () => {
    const args = {
      amount: createMoney(1, 'STX'),
      availableBalance: createMoney(2, 'STX'),
      fee: createMoney(Infinity, 'STX'),
    };
    expect(() => isStxBalanceSufficient(args)).toThrow('UnknownFee');
  });
});
