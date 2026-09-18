import type { BtcStakingPosition } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';

import {
  describePastPositions,
  getRenewalOpensAt,
  isPastPosition,
  summarizePastPositions,
} from './bond-positions.utils';

function createPosition(
  status: BtcStakingPosition['status'],
  estimatedUnlockAt = new Date('2026-11-12T00:00:00Z'),
  rewardsClaimed: BtcStakingPosition['rewardsClaimed'] = null
): BtcStakingPosition {
  return { status, estimatedUnlockAt, rewardsClaimed } as unknown as BtcStakingPosition;
}

describe(getRenewalOpensAt.name, () => {
  test('opens at the earliest unlock among locked positions', () => {
    const opensAt = getRenewalOpensAt([
      createPosition('locked', new Date('2026-11-20T00:00:00Z')),
      createPosition('locked', new Date('2026-11-12T00:00:00Z')),
      createPosition('exiting', new Date('2026-11-01T00:00:00Z')),
    ]);
    expect(opensAt?.toISOString()).toEqual('2026-11-12T00:00:00.000Z');
  });

  test('is already open once any position has matured', () => {
    const opensAt = getRenewalOpensAt([
      createPosition('matured', new Date('2026-11-01T00:00:00Z')),
      createPosition('locked', new Date('2026-11-20T00:00:00Z')),
    ]);
    expect(opensAt).toBeUndefined();
  });
});

describe(isPastPosition.name, () => {
  test('treats only withdrawn and exited bonds as past', () => {
    expect(isPastPosition(createPosition('reclaimed'))).toBe(true);
    expect(isPastPosition(createPosition('exited'))).toBe(true);
    expect(isPastPosition(createPosition('matured'))).toBe(false);
    expect(isPastPosition(createPosition('locked'))).toBe(false);
    expect(isPastPosition(createPosition('exiting'))).toBe(false);
  });
});

describe(summarizePastPositions.name, () => {
  test('counts past positions and sums their paid out rewards', () => {
    const summary = summarizePastPositions([
      createPosition('reclaimed', undefined, createMoney(1_035_000, 'BTC')),
      createPosition('exited', undefined, createMoney(2_069_000, 'BTC')),
      createPosition('exited'),
      createPosition('matured', undefined, createMoney(500_000, 'BTC')),
    ]);
    expect(summary.count).toEqual(3);
    expect(summary.earned?.amount.toString()).toEqual('3104000');
  });

  test('has no earned figure when no past position reports rewards', () => {
    expect(summarizePastPositions([createPosition('exited')]).earned).toBeNull();
  });
});

describe(describePastPositions.name, () => {
  test('describes the count and the earned amount', () => {
    const earned = createMoney(3_104_000, 'BTC');
    expect(describePastPositions({ count: 3, earned })).toEqual(
      `3 ended, +${formatCurrency(earned)} earned`
    );
  });

  test('describes the count alone without rewards', () => {
    expect(describePastPositions({ count: 1, earned: null })).toEqual('1 ended');
  });
});
