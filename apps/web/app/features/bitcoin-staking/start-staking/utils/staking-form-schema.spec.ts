import { createMoney } from '@leather.io/utils';

import { createStakingFormSchema } from './staking-form-schema';

const hundredStxMicro = 100_000_000;

function makeSchema(overrides?: { supportsBtcPayout?: boolean; availableMicroStx?: number }) {
  return createStakingFormSchema({
    networkMode: 'mainnet',
    availableBalance: createMoney(overrides?.availableMicroStx ?? hundredStxMicro, 'STX'),
    supportsBtcPayout: overrides?.supportsBtcPayout ?? false,
  });
}

const validValues = {
  amount: '50',
  cycles: '12',
  payoutEnabled: false,
};

describe(createStakingFormSchema.name, () => {
  test('accepts a valid amount and cycle count', () => {
    const result = makeSchema().safeParse(validValues);
    expect(result.success).toBe(true);
  });

  test('accepts a small amount now that pools impose no minimum', () => {
    expect(makeSchema().safeParse({ ...validValues, amount: '10' }).success).toBe(true);
  });

  test('rejects amounts with more than 6 decimal places', () => {
    expect(makeSchema().safeParse({ ...validValues, amount: '0.0000001' }).success).toBe(false);
    expect(makeSchema().safeParse({ ...validValues, amount: '1.1234567' }).success).toBe(false);
    expect(makeSchema().safeParse({ ...validValues, amount: '0.000001' }).success).toBe(true);
    expect(makeSchema().safeParse({ ...validValues, amount: '1.123456' }).success).toBe(true);
  });

  test('rejects an amount above the available balance', () => {
    expect(makeSchema().safeParse({ ...validValues, amount: '150' }).success).toBe(false);
  });

  test('accepts an amount equal to the available balance', () => {
    expect(makeSchema().safeParse({ ...validValues, amount: '100' }).success).toBe(true);
  });

  test('rejects cycle counts outside 1-96 and non-integers', () => {
    expect(makeSchema().safeParse({ ...validValues, cycles: '0' }).success).toBe(false);
    expect(makeSchema().safeParse({ ...validValues, cycles: '97' }).success).toBe(false);
    expect(makeSchema().safeParse({ ...validValues, cycles: '1.5' }).success).toBe(false);
    expect(makeSchema().safeParse({ ...validValues, cycles: '1' }).success).toBe(true);
    expect(makeSchema().safeParse({ ...validValues, cycles: '96' }).success).toBe(true);
  });

  test('ignores payout fields when the pool does not support BTC payout', () => {
    const result = makeSchema({ supportsBtcPayout: false }).safeParse({
      ...validValues,
      payoutEnabled: true,
      rewardAddress: 'not-an-address',
    });
    expect(result.success).toBe(true);
  });

  test('ignores payout fields when the toggle is off', () => {
    const result = makeSchema({ supportsBtcPayout: true }).safeParse({
      ...validValues,
      payoutEnabled: false,
      rewardAddress: 'not-an-address',
    });
    expect(result.success).toBe(true);
  });

  test('requires a valid address and max fee when payout is enabled', () => {
    const schema = makeSchema({ supportsBtcPayout: true });

    const missingBoth = schema.safeParse({ ...validValues, payoutEnabled: true });
    expect(missingBoth.success).toBe(false);

    const invalidAddress = schema.safeParse({
      ...validValues,
      payoutEnabled: true,
      rewardAddress: 'not-an-address',
      maxFeeSats: '2500',
    });
    expect(invalidAddress.success).toBe(false);

    const missingFee = schema.safeParse({
      ...validValues,
      payoutEnabled: true,
      rewardAddress: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
    });
    expect(missingFee.success).toBe(false);

    const zeroFee = schema.safeParse({
      ...validValues,
      payoutEnabled: true,
      rewardAddress: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
      maxFeeSats: '0',
    });
    expect(zeroFee.success).toBe(false);

    const valid = schema.safeParse({
      ...validValues,
      payoutEnabled: true,
      rewardAddress: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
      maxFeeSats: '2500',
    });
    expect(valid.success).toBe(true);
  });

  test('rejects a testnet address on mainnet', () => {
    const schema = makeSchema({ supportsBtcPayout: true });
    const result = schema.safeParse({
      ...validValues,
      payoutEnabled: true,
      rewardAddress: 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx',
      maxFeeSats: '2500',
    });
    expect(result.success).toBe(false);
  });
});
