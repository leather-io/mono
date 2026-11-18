import { describe, expect, it } from 'vitest';

import { SBTC_RECLAIM_URL } from '@leather.io/constants';

import { createSbtcDepositOverlay } from './sbtc-deposit-overlay';

describe('createSbtcDepositOverlay', () => {
  it('labels a pending deposit as awaiting confirmation', () => {
    const overlay = createSbtcDepositOverlay('pending');

    expect(overlay?.title).toBe('BTC → sBTC');
    expect(overlay?.statusLabel).toBe('Pending deposit');
    expect(overlay?.statusColor).toBe('yellow.action-primary-default');
  });

  it('labels an accepted deposit as awaiting the mint', () => {
    const overlay = createSbtcDepositOverlay('accepted');

    expect(overlay?.statusLabel).toBe('Pending mint');
    expect(overlay?.statusColor).toBe('yellow.action-primary-default');
  });

  it('labels a failed deposit and offers a reclaim link to the bridge', () => {
    const overlay = createSbtcDepositOverlay('failed');

    expect(overlay?.statusLabel).toBe('Failed');
    expect(overlay?.statusColor).toBe('red.action-primary-default');
    expect(overlay?.reclaimUrl).toBe(SBTC_RECLAIM_URL);
  });

  it('labels a replaced deposit without offering a reclaim link', () => {
    const overlay = createSbtcDepositOverlay('rbf');

    expect(overlay?.statusLabel).toBe('Replaced');
    expect(overlay?.statusColor).toBe('red.action-primary-default');
    expect(overlay?.reclaimUrl).toBeUndefined();
  });

  it('leaves a confirmed deposit alone so the feed row renders as itself', () => {
    expect(createSbtcDepositOverlay('confirmed')).toBeUndefined();
  });

  it('only offers a reclaim link on failed deposits', () => {
    const statuses = ['pending', 'accepted', 'rbf'] as const;

    for (const status of statuses) {
      expect(createSbtcDepositOverlay(status)?.reclaimUrl).toBeUndefined();
    }
  });
});
