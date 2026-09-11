import { stxToMicroStx } from '@leather.io/utils';

import { createUpdateStakingSchema, updateStakingMessages } from './update-staking-schema';

const baseArgs = {
  availableBalance: stxToMicroStx(1_000),
  maxCyclesToExtend: 10,
  payoutMode: 'sbtc' as const,
  supportsMinClaim: false,
  networkMode: 'mainnet' as const,
  currentPayout: null,
  isSwitching: false,
};

const emptyUpdate = {
  cyclesToExtend: 0,
  amountIncrease: '',
  payoutEnabled: false,
  rewardAddress: undefined,
  maxFeeSats: undefined,
};

describe(createUpdateStakingSchema.name, () => {
  test('rejects an update that changes nothing', () => {
    const schema = createUpdateStakingSchema(baseArgs);
    const result = schema.safeParse(emptyUpdate);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(updateStakingMessages.nothingToUpdate);
    }
  });

  test('accepts a pure switch with no other changes', () => {
    const schema = createUpdateStakingSchema({ ...baseArgs, isSwitching: true });
    expect(schema.safeParse(emptyUpdate).success).toBe(true);
  });

  test('accepts a pure switch on a position already at max cycles', () => {
    const schema = createUpdateStakingSchema({
      ...baseArgs,
      maxCyclesToExtend: 0,
      isSwitching: true,
    });
    expect(schema.safeParse(emptyUpdate).success).toBe(true);
  });

  test('still validates cycle bounds while switching', () => {
    const schema = createUpdateStakingSchema({ ...baseArgs, isSwitching: true });
    expect(schema.safeParse({ ...emptyUpdate, cyclesToExtend: 11 }).success).toBe(false);
  });

  test('validates payout fields against the effective pool support', () => {
    const withPayout = {
      ...emptyUpdate,
      payoutEnabled: true,
      rewardAddress: 'not-an-address',
      maxFeeSats: '0',
    };

    const supportedSchema = createUpdateStakingSchema({
      ...baseArgs,
      payoutMode: 'sbtc-or-btc' as const,
      isSwitching: true,
    });
    const supportedResult = supportedSchema.safeParse(withPayout);
    expect(supportedResult.success).toBe(false);
    if (!supportedResult.success) {
      const paths = supportedResult.error.issues.map(issue => issue.path[0]);
      expect(paths).toContain('rewardAddress');
      expect(paths).toContain('maxFeeSats');
    }

    const unsupportedSchema = createUpdateStakingSchema({ ...baseArgs, isSwitching: true });
    expect(unsupportedSchema.safeParse(withPayout).success).toBe(true);
  });

  test('treats a payout change alone as an update', () => {
    const schema = createUpdateStakingSchema({
      ...baseArgs,
      payoutMode: 'sbtc-or-btc' as const,
      currentPayout: null,
    });
    const result = schema.safeParse({
      ...emptyUpdate,
      payoutEnabled: true,
      rewardAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
      maxFeeSats: '5000',
    });
    expect(result.success).toBe(true);
  });

  test('treats a min-claim change alone as an update', () => {
    const currentPayout = {
      btcRewardAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
      maxFeeSats: 5000n,
      minClaimSats: 5547n,
    };
    const schema = createUpdateStakingSchema({
      ...baseArgs,
      payoutMode: 'sbtc-or-btc' as const,
      supportsMinClaim: true,
      currentPayout,
    });
    const unchangedPayout = {
      ...emptyUpdate,
      payoutEnabled: true,
      rewardAddress: currentPayout.btcRewardAddress,
      maxFeeSats: '5000',
      minClaimSats: '5547',
    };

    expect(schema.safeParse(unchangedPayout).success).toBe(false);
    expect(schema.safeParse({ ...unchangedPayout, minClaimSats: '25000' }).success).toBe(true);
  });

  describe('for an operator-paid pool', () => {
    const registeredAddress = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
    const currentPayout = { btcRewardAddress: registeredAddress };
    const schema = createUpdateStakingSchema({
      ...baseArgs,
      payoutMode: 'btc-only' as const,
      currentPayout,
    });

    test('requires a valid payout address even with the toggle off', () => {
      const result = schema.safeParse({ ...emptyUpdate, cyclesToExtend: 2, rewardAddress: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.map(issue => issue.path[0])).toEqual(['rewardAddress']);
      }
    });

    test('ignores the fee inputs', () => {
      const result = schema.safeParse({
        ...emptyUpdate,
        cyclesToExtend: 2,
        rewardAddress: registeredAddress,
        maxFeeSats: '0',
        minClaimSats: 'abc',
      });
      expect(result.success).toBe(true);
    });

    test('treats keeping the registered address as no payout change', () => {
      const result = schema.safeParse({ ...emptyUpdate, rewardAddress: registeredAddress });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(updateStakingMessages.nothingToUpdate);
      }
    });

    test('treats a new payout address alone as an update', () => {
      const result = schema.safeParse({
        ...emptyUpdate,
        rewardAddress: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('when switching to a pool with a minimum stake', () => {
    const minStake = { poolName: 'PlanBetter', minStakeMicroStx: 1_000_000_000n };
    const address = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';

    test('rejects a switch whose total stays below the minimum', () => {
      const schema = createUpdateStakingSchema({
        ...baseArgs,
        payoutMode: 'btc-only' as const,
        isSwitching: true,
        currentAmountMicroStx: 400_000_000n,
        minStake,
      });
      const result = schema.safeParse({ ...emptyUpdate, rewardAddress: address });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(candidate => candidate.path[0] === 'amountIncrease');
        expect(issue?.message).toBe(
          'PlanBetter requires a total stake of at least 1,000 STX; add more STX to switch'
        );
      }
    });

    test('accepts a switch once the increase lifts the total to the minimum', () => {
      const schema = createUpdateStakingSchema({
        ...baseArgs,
        payoutMode: 'btc-only' as const,
        isSwitching: true,
        currentAmountMicroStx: 400_000_000n,
        minStake,
      });
      expect(
        schema.safeParse({ ...emptyUpdate, amountIncrease: '600', rewardAddress: address }).success
      ).toBe(true);
    });

    test('never blocks an existing member, whose position already meets the floor', () => {
      const schema = createUpdateStakingSchema({
        ...baseArgs,
        payoutMode: 'btc-only' as const,
        currentPayout: { btcRewardAddress: address },
        currentAmountMicroStx: 1_000_000_000n,
        minStake,
      });
      expect(
        schema.safeParse({ ...emptyUpdate, cyclesToExtend: 1, rewardAddress: address }).success
      ).toBe(true);
    });
  });
});
