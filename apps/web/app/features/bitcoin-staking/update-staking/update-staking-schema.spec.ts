import { stxToMicroStx } from '@leather.io/utils';

import { createUpdateStakingSchema, updateStakingMessages } from './update-staking-schema';

const baseArgs = {
  availableBalance: stxToMicroStx(1_000),
  maxCyclesToExtend: 10,
  supportsBtcPayout: false,
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
      supportsBtcPayout: true,
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
      supportsBtcPayout: true,
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
});
