import type { BtcStakingPosition } from '@leather.io/models';

import { getRenewalOpensAt } from './bond-positions.utils';

function createPosition(
  status: BtcStakingPosition['status'],
  estimatedUnlockAt: Date
): BtcStakingPosition {
  return { status, estimatedUnlockAt } as unknown as BtcStakingPosition;
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
