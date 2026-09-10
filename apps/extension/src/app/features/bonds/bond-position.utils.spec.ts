import type { BtcStakingPosition, BtcStakingPositionStatus } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import {
  daysUntil,
  findEndingSoonPosition,
  findMaturedPosition,
  isEndingSoon,
  isUpcomingPosition,
  sortByUnlock,
  sumBondStx,
} from './bond-position.utils';

const now = new Date('2026-11-06T00:00:00Z');

function inDays(days: number) {
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

interface PositionOverrides {
  bondIndex?: number;
  status?: BtcStakingPositionStatus;
  bondStatus?: 'upcoming' | 'active' | 'unlocked';
  unlocksInDays?: number;
  stxStacked?: number | null;
}

function position({
  bondIndex = 4,
  status = 'locked',
  bondStatus = 'active',
  unlocksInDays = 30,
  stxStacked = 10_000,
}: PositionOverrides = {}): BtcStakingPosition {
  return {
    bondIndex,
    stxAddress: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
    stakerAddress: 'bc1qnrq3d7v0kx7z3l0mfk2hjfhz6q3lz0k7q0h3sn',
    outputs: [],
    exitAnnouncedAtBurnHeight: null,
    status,
    amount: createMoney(200_000_000, 'BTC'),
    stxStacked: stxStacked === null ? null : createMoney(stxStacked * 1_000_000, 'STX'),
    rewardsAccrued: null,
    rewardsClaimed: null,
    unlockBurnHeight: 922_900,
    estimatedUnlockAt: inDays(unlocksInDays),
    estimatedActivationAt: inDays(unlocksInDays - 70),
    bond: {
      index: bondIndex,
      status: bondStatus,
      activationBurnHeight: 912_400,
      unlockBurnHeight: 922_900,
    },
  };
}

describe('bond position utils', () => {
  it('flags a position unlocking inside the week', () => {
    expect(isEndingSoon(position({ unlocksInDays: 6 }), now)).toBe(true);
    expect(isEndingSoon(position({ unlocksInDays: 30 }), now)).toBe(false);
    expect(isEndingSoon(position({ status: 'matured', unlocksInDays: -1 }), now)).toBe(false);
  });

  it('counts whole days up to the unlock', () => {
    expect(daysUntil(new Date('2026-11-12T00:00:00Z'), now)).toBe(6);
    expect(daysUntil(new Date('2026-11-12T00:00:01Z'), now)).toBe(7);
    expect(daysUntil(new Date('2026-11-05T00:00:00Z'), now)).toBe(0);
  });

  it('sums only the STX of running bonds', () => {
    const running = position({ bondIndex: 4, stxStacked: 10_000 });
    const upcoming = position({ bondIndex: 5, bondStatus: 'upcoming', stxStacked: 10_000 });
    expect(sumBondStx([running, upcoming]).amount.toNumber()).toBe(10_000_000_000);
    expect(sumBondStx([]).amount.toNumber()).toBe(0);
  });

  it('treats a registered next period as upcoming', () => {
    const positions = [
      position({ bondIndex: 4 }),
      position({ bondIndex: 5, bondStatus: 'upcoming' }),
    ];
    const upcoming = positions.filter(isUpcomingPosition);
    expect(upcoming).toHaveLength(1);
    expect(upcoming[0]?.bondIndex).toBe(5);
  });

  it('orders by soonest unlock', () => {
    const sorted = sortByUnlock([
      position({ bondIndex: 4, unlocksInDays: 30 }),
      position({ bondIndex: 2, unlocksInDays: -60 }),
      position({ bondIndex: 3, unlocksInDays: -10 }),
    ]);
    expect(sorted.map(p => p.bondIndex)).toEqual([2, 3, 4]);
  });

  it('picks the position a callout should talk about', () => {
    const endingSoon = [position({ bondIndex: 4, unlocksInDays: 6 })];
    const midTerm = [position({ bondIndex: 4, unlocksInDays: 30 })];
    const matured = [position({ bondIndex: 4, status: 'matured', unlocksInDays: -1 })];
    expect(findEndingSoonPosition(endingSoon, now)?.bondIndex).toBe(4);
    expect(findEndingSoonPosition(midTerm, now)).toBeUndefined();
    expect(findMaturedPosition(matured)?.bondIndex).toBe(4);
  });
});
