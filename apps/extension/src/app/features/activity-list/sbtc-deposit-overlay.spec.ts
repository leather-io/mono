import { describe, expect, it } from 'vitest';

import { SBTC_RECLAIM_URL } from '@leather.io/constants';

import { createSbtcDepositOverlay } from './sbtc-deposit-overlay';

const bitcoinTxid = 'e0f1c9b2a3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e';

describe('createSbtcDepositOverlay', () => {
  it('labels a pending deposit as awaiting confirmation', () => {
    const overlay = createSbtcDepositOverlay('pending', bitcoinTxid);

    expect(overlay?.title).toBe('BTC → sBTC');
    expect(overlay?.statusLabel).toBe('Pending deposit');
    expect(overlay?.statusColor).toBe('yellow.action-primary-default');
  });

  it('labels an accepted deposit as awaiting the mint', () => {
    const overlay = createSbtcDepositOverlay('accepted', bitcoinTxid);

    expect(overlay?.statusLabel).toBe('Pending mint');
    expect(overlay?.statusColor).toBe('yellow.action-primary-default');
  });

  it('labels a failed deposit and offers a reclaim link for its funding tx', () => {
    const overlay = createSbtcDepositOverlay('failed', bitcoinTxid);

    expect(overlay?.statusLabel).toBe('Failed');
    expect(overlay?.statusColor).toBe('red.action-primary-default');
    expect(overlay?.reclaimUrl).toBe(`${SBTC_RECLAIM_URL}${bitcoinTxid}`);
  });

  it('labels a replaced deposit without offering a reclaim link', () => {
    const overlay = createSbtcDepositOverlay('rbf', bitcoinTxid);

    expect(overlay?.statusLabel).toBe('Replaced');
    expect(overlay?.statusColor).toBe('red.action-primary-default');
    expect(overlay?.reclaimUrl).toBeUndefined();
  });

  it('leaves a confirmed deposit alone so the feed row renders as itself', () => {
    expect(createSbtcDepositOverlay('confirmed', bitcoinTxid)).toBeUndefined();
  });

  it('only offers a reclaim link on failed deposits', () => {
    const statuses = ['pending', 'accepted', 'rbf'] as const;

    for (const status of statuses) {
      expect(createSbtcDepositOverlay(status, bitcoinTxid)?.reclaimUrl).toBeUndefined();
    }
  });
});
