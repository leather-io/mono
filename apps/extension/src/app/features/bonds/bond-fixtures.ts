import type { BondContext, BondPosition } from './bond-position.model';

/**
 * Named scenarios, one per state the design covers. Selected in non-production
 * builds through the `leather-mock-bond` localStorage key, see
 * `use-bond-position.ts`.
 */
export const bondScenarios = ['none', 'active', 'ending-soon', 'renewal-set', 'unlocked'] as const;

export type BondScenario = (typeof bondScenarios)[number];

export function isBondScenario(value: unknown): value is BondScenario {
  return bondScenarios.some(scenario => scenario === value);
}

export const bondScenarioLabels: Record<BondScenario, string> = {
  none: 'No bond',
  active: 'Active, mid-term',
  'ending-soon': 'Active, ends in 6 days',
  'renewal-set': 'Ends in 6 days, renewal set',
  unlocked: 'Unlocked, funds returned',
};

// Period 4 runs 912,400 → 922,900. Period 5 registration is open 922,900 → 924,340.
const period4 = { bondIndex: 4, startBurnHeight: 912_400, unlockBurnHeight: 922_900 };
const period5 = { bondIndex: 5, startBurnHeight: 924_340, unlockBurnHeight: 934_840 };
const period5Window = {
  bondIndex: 5,
  registrationOpensBurnHeight: 922_900,
  registrationClosesBurnHeight: 924_340,
};

const activePosition: BondPosition = {
  ...period4,
  status: 'active',
  amountSats: 200_000_000,
  amountUstx: 10_000_000_000,
  policyAddress: 'bc1qk7v3p9d2x0h4m8s6n5t2q8w9e1r3t5y7u9i0o2p4a6s8d0f2g4h6j8k0l7ge2',
  paidOutSats: 1_035_000,
  nextPeriod: period5Window,
};

const sixDaysInBlocks = 6 * 144;

export const bondFixtures: Record<BondScenario, BondContext> = {
  none: { position: null, burnBlockHeight: 918_000 },
  active: { position: activePosition, burnBlockHeight: 918_000 },
  'ending-soon': {
    position: activePosition,
    burnBlockHeight: period4.unlockBurnHeight - sixDaysInBlocks,
  },
  'renewal-set': {
    position: { ...activePosition, renewal: period5 },
    burnBlockHeight: period4.unlockBurnHeight - sixDaysInBlocks,
  },
  unlocked: {
    position: { ...activePosition, status: 'unlocked' },
    burnBlockHeight: period4.unlockBurnHeight + 60,
  },
};
