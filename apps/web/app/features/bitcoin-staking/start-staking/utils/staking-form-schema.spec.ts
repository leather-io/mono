import { createMoney } from '@leather.io/utils';

import { PoolPayoutMode } from '../../utils/pool-payout';
import {
  PoolMinStake,
  buildPayoutPreference,
  createStakingFormSchema,
} from './staking-form-schema';

const hundredStxMicro = 100_000_000;
const planbetterMinStake: PoolMinStake = {
  poolName: 'PlanBetter',
  minStakeMicroStx: 1_000_000_000n,
};

function makeSchema(overrides?: {
  payoutMode?: PoolPayoutMode;
  minStake?: PoolMinStake;
  supportsMinClaim?: boolean;
  availableMicroStx?: number;
}) {
  return createStakingFormSchema({
    networkMode: 'mainnet',
    availableBalance: createMoney(overrides?.availableMicroStx ?? hundredStxMicro, 'STX'),
    payoutMode: overrides?.payoutMode ?? 'sbtc',
    minStake: overrides?.minStake,
    supportsMinClaim: overrides?.supportsMinClaim ?? false,
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
    const result = makeSchema({ payoutMode: 'sbtc' }).safeParse({
      ...validValues,
      payoutEnabled: true,
      rewardAddress: 'not-an-address',
    });
    expect(result.success).toBe(true);
  });

  test('ignores payout fields when the toggle is off', () => {
    const result = makeSchema({ payoutMode: 'sbtc-or-btc' }).safeParse({
      ...validValues,
      payoutEnabled: false,
      rewardAddress: 'not-an-address',
    });
    expect(result.success).toBe(true);
  });

  test('requires a valid address and max fee when payout is enabled', () => {
    const schema = makeSchema({ payoutMode: 'sbtc-or-btc' });

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

  test('rejects a max fee below 1,000 sats', () => {
    const schema = makeSchema({ payoutMode: 'sbtc-or-btc' });
    const belowFloor = schema.safeParse({
      ...validValues,
      payoutEnabled: true,
      rewardAddress: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
      maxFeeSats: '999',
    });
    expect(belowFloor.success).toBe(false);

    const atFloor = schema.safeParse({
      ...validValues,
      payoutEnabled: true,
      rewardAddress: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
      maxFeeSats: '1000',
    });
    expect(atFloor.success).toBe(true);
  });

  test('validates the min claim only when the pool supports it', () => {
    const withMinClaim = makeSchema({ payoutMode: 'sbtc-or-btc', supportsMinClaim: true });
    const withoutMinClaim = makeSchema({ payoutMode: 'sbtc-or-btc', supportsMinClaim: false });
    const payoutValues = {
      ...validValues,
      payoutEnabled: true,
      rewardAddress: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
      maxFeeSats: '2500',
    };

    expect(withMinClaim.safeParse(payoutValues).success).toBe(true);
    expect(withMinClaim.safeParse({ ...payoutValues, minClaimSats: 'abc' }).success).toBe(false);
    expect(withMinClaim.safeParse({ ...payoutValues, minClaimSats: '3046' }).success).toBe(false);
    expect(withMinClaim.safeParse({ ...payoutValues, minClaimSats: '3047' }).success).toBe(true);
    expect(withoutMinClaim.safeParse({ ...payoutValues, minClaimSats: 'abc' }).success).toBe(true);
  });

  test('reports payout issues even while the amount is still missing', () => {
    const schema = makeSchema({ payoutMode: 'sbtc-or-btc', supportsMinClaim: true });
    const result = schema.safeParse({
      cycles: '12',
      payoutEnabled: true,
      rewardAddress: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
      maxFeeSats: '999',
      minClaimSats: '100',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map(issue => issue.path[0]);
      expect(paths).toContain('amount');
      expect(paths).toContain('maxFeeSats');
      expect(paths).toContain('minClaimSats');
    }
  });

  test('rejects a testnet address on mainnet', () => {
    const schema = makeSchema({ payoutMode: 'sbtc-or-btc' });
    const result = schema.safeParse({
      ...validValues,
      payoutEnabled: true,
      rewardAddress: 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx',
      maxFeeSats: '2500',
    });
    expect(result.success).toBe(false);
  });

  describe('when the pool pays native BTC off chain', () => {
    const schema = makeSchema({ payoutMode: 'btc-only' });

    test('requires a payout address regardless of the toggle', () => {
      const result = schema.safeParse({ ...validValues, payoutEnabled: false });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.map(issue => issue.path[0])).toEqual(['rewardAddress']);
      }
    });

    test('rejects an invalid address', () => {
      expect(schema.safeParse({ ...validValues, rewardAddress: 'not-an-address' }).success).toBe(
        false
      );
    });

    test('accepts every address type the contract accepts', () => {
      const addresses = [
        '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
        '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
        'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
        'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3',
        'bc1pmfr3p9j00pfxjh0zmgp99y8zftmd3s5pmedqhyptwy6lm87hf5sspknck9',
      ];
      addresses.forEach(rewardAddress => {
        expect(schema.safeParse({ ...validValues, rewardAddress }).success).toBe(true);
      });
    });

    test('never validates the max fee or min claim fields', () => {
      const result = schema.safeParse({
        ...validValues,
        rewardAddress: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
        maxFeeSats: '0',
        minClaimSats: 'abc',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('when the pool enforces a minimum stake', () => {
    const schema = makeSchema({ minStake: planbetterMinStake, availableMicroStx: 5_000_000_000 });

    test('rejects an amount below the minimum with the pool named', () => {
      const result = schema.safeParse({ ...validValues, amount: '999.999999' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          'PlanBetter requires a stake of at least 1,000 STX'
        );
      }
    });

    test('accepts exactly the minimum', () => {
      expect(schema.safeParse({ ...validValues, amount: '1000' }).success).toBe(true);
    });

    test('accepts more than the minimum', () => {
      expect(schema.safeParse({ ...validValues, amount: '2500' }).success).toBe(true);
    });
  });
});

describe(buildPayoutPreference.name, () => {
  const rewardAddress = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';

  test('is undefined when the pool pays sBTC only', () => {
    expect(
      buildPayoutPreference(
        { payoutEnabled: true, rewardAddress, maxFeeSats: '2500' },
        'sbtc',
        false
      )
    ).toBeUndefined();
  });

  test('is undefined when the toggle is off for an optional BTC payout', () => {
    expect(
      buildPayoutPreference(
        { payoutEnabled: false, rewardAddress, maxFeeSats: '2500' },
        'sbtc-or-btc',
        false
      )
    ).toBeUndefined();
  });

  test('carries the max fee and, when supported, the min claim for an optional BTC payout', () => {
    const values = { payoutEnabled: true, rewardAddress, maxFeeSats: '2500', minClaimSats: '9000' };
    expect(buildPayoutPreference(values, 'sbtc-or-btc', true)).toEqual({
      btcRewardAddress: rewardAddress,
      maxFeeSats: 2500n,
      minClaimSats: 9000n,
    });
    expect(buildPayoutPreference(values, 'sbtc-or-btc', false)).toEqual({
      btcRewardAddress: rewardAddress,
      maxFeeSats: 2500n,
    });
  });

  test('is address-only for an operator-paid pool, ignoring the toggle and fee inputs', () => {
    expect(
      buildPayoutPreference(
        { payoutEnabled: false, rewardAddress, maxFeeSats: '2500', minClaimSats: '9000' },
        'btc-only',
        true
      )
    ).toEqual({ btcRewardAddress: rewardAddress });
  });
});
