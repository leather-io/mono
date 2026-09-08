import type {
  BtcBondEnrollmentWindow,
  BtcBondOutput,
  BtcStakingPosition,
  BtcStakingPositionStatus,
} from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import type { BondScenario } from './bond-scenarios';

export interface BondFixture {
  /** Burn chain tip the scenario is frozen at */
  burnTip: number;
  positions: BtcStakingPosition[];
  enrollmentWindow: BtcBondEnrollmentWindow | null;
  /** Unspent bonded sats, what the balance service would report as `locked` */
  lockedSats: number;
}

const tenMinutesMs = 10 * 60 * 1000;
const blocksPerDay = 144;

function dateAtHeight(height: number, burnTip: number) {
  return new Date(Date.now() + (height - burnTip) * tenMinutesMs);
}

const stakerAddress = 'bc1qm3l7sc65zpw79lxes69zkqmk6ee3ewf0j77s3h';
const stxAddress = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';

// Period 4 runs 912,400 → 922,900. Period 5 activates at 924,340; its
// registration closes one prepare phase (100 blocks) before that.
const period4 = { index: 4, activationBurnHeight: 912_400, unlockBurnHeight: 922_900 };
const period5 = { index: 5, activationBurnHeight: 924_340, unlockBurnHeight: 934_840 };

const twoBtcSats = 200_000_000;

function output(txid: string, unlockBurnHeight: number, spent = false): BtcBondOutput {
  return { txid, vout: 0, amount: createMoney(twoBtcSats, 'BTC'), unlockBurnHeight, spent };
}

interface PositionOptions {
  bond: typeof period4;
  bondStatus: BtcStakingPosition['bond']['status'];
  status: BtcStakingPositionStatus;
  burnTip: number;
  outputs: BtcBondOutput[];
  amountSats?: number;
  exitAnnouncedAtBurnHeight?: number | null;
  rewardsClaimedSats?: number;
  rewardsAccruedSats?: number;
}

function position({
  bond,
  bondStatus,
  status,
  burnTip,
  outputs,
  amountSats = twoBtcSats,
  exitAnnouncedAtBurnHeight = null,
  rewardsClaimedSats = 1_035_000,
  rewardsAccruedSats = 1_200_000,
}: PositionOptions): BtcStakingPosition {
  return {
    bondIndex: bond.index,
    stxAddress,
    stakerAddress,
    outputs,
    exitAnnouncedAtBurnHeight,
    status,
    amount: createMoney(amountSats, 'BTC'),
    stxStacked: createMoney(10_000_000_000, 'STX'),
    rewardsAccrued: createMoney(rewardsAccruedSats, 'BTC'),
    rewardsClaimed: createMoney(rewardsClaimedSats, 'BTC'),
    unlockBurnHeight: bond.unlockBurnHeight,
    estimatedUnlockAt: dateAtHeight(bond.unlockBurnHeight, burnTip),
    estimatedActivationAt: dateAtHeight(bond.activationBurnHeight, burnTip),
    bond: { ...bond, status: bondStatus },
  };
}

function enrollmentWindow(burnTip: number): BtcBondEnrollmentWindow {
  const closesAtBurnHeight = period5.activationBurnHeight - 100;
  return {
    bondIndex: period5.index,
    activationBurnHeight: period5.activationBurnHeight,
    closesAtBurnHeight,
    estimatedActivationAt: dateAtHeight(period5.activationBurnHeight, burnTip),
    estimatedClosesAt: dateAtHeight(closesAtBurnHeight, burnTip),
  };
}

const period4Output = output(
  '7a3f9c21e4b8d6f0a2c5e8b1d4f7a0c3e6b9d2f5a8c1e4b7d0f3a6c9e2b5d8f1',
  922_900
);

function activeFixture(burnTip: number): BondFixture {
  return {
    burnTip,
    positions: [
      position({
        bond: period4,
        bondStatus: 'active',
        status: 'locked',
        burnTip,
        outputs: [period4Output],
      }),
    ],
    enrollmentWindow: enrollmentWindow(burnTip),
    lockedSats: twoBtcSats,
  };
}

const midTermTip = 918_000;
const sixDaysOutTip = period4.unlockBurnHeight - 6 * blocksPerDay;
const afterUnlockTip = period4.unlockBurnHeight + 60;

function buildFixtures(): Record<BondScenario, BondFixture> {
  const endingSoon = activeFixture(sixDaysOutTip);
  const active = activeFixture(midTermTip);

  return {
    none: { burnTip: midTermTip, positions: [], enrollmentWindow: null, lockedSats: 0 },

    active,

    'ending-soon': endingSoon,

    // Registered for period 5 already. The registration carries the amount but
    // no lock output yet, so it does not count as locked.
    'renewal-set': {
      ...endingSoon,
      positions: [
        ...endingSoon.positions,
        position({
          bond: period5,
          bondStatus: 'upcoming',
          status: 'locked',
          burnTip: sixDaysOutTip,
          outputs: [],
          rewardsClaimedSats: 0,
          rewardsAccruedSats: 0,
        }),
      ],
    },

    // Timelock expired, output still sitting in the script until withdrawn.
    matured: {
      burnTip: afterUnlockTip,
      positions: [
        position({
          bond: period4,
          bondStatus: 'unlocked',
          status: 'matured',
          burnTip: afterUnlockTip,
          outputs: [period4Output],
        }),
      ],
      enrollmentWindow: enrollmentWindow(afterUnlockTip),
      lockedSats: twoBtcSats,
    },

    exiting: {
      ...active,
      positions: [
        position({
          bond: period4,
          bondStatus: 'active',
          status: 'exiting',
          burnTip: midTermTip,
          outputs: [period4Output],
          exitAnnouncedAtBurnHeight: midTermTip - 500,
        }),
      ],
    },

    'with-history': {
      ...active,
      positions: [
        ...active.positions,
        position({
          bond: { index: 3, activationBurnHeight: 891_400, unlockBurnHeight: 901_900 },
          bondStatus: 'unlocked',
          status: 'reclaimed',
          burnTip: midTermTip,
          outputs: [
            output(
              '3e5b2a94c7d0f3a6b9e2c5d8f1a4b7c0d3e6f9a2b5c8d1e4f7a0b3c6d9e2f5a8',
              901_900,
              true
            ),
          ],
          rewardsClaimedSats: 1_604_000,
          rewardsAccruedSats: 1_604_000,
        }),
        position({
          bond: { index: 2, activationBurnHeight: 880_900, unlockBurnHeight: 891_400 },
          bondStatus: 'unlocked',
          status: 'exited',
          burnTip: midTermTip,
          outputs: [
            output(
              '9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d',
              891_400,
              true
            ),
          ],
          exitAnnouncedAtBurnHeight: 885_000,
          rewardsClaimedSats: 1_500_000,
          rewardsAccruedSats: 1_500_000,
        }),
      ],
    },
  };
}

// Dates are relative to "now", so build lazily and refresh per call.
export function getBondFixture(scenario: BondScenario): BondFixture {
  return buildFixtures()[scenario];
}

const spentStatuses: BtcStakingPositionStatus[] = ['reclaimed', 'exited'];

/** Mirrors the service's `includeSpent` option */
export function filterFixturePositions(fixture: BondFixture, includeSpent?: boolean) {
  if (includeSpent) return fixture.positions;
  return fixture.positions.filter(p => !spentStatuses.includes(p.status));
}
