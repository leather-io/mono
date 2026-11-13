import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchBondTargetRate, formatBondTargetRate } from './bond-target-rate';

function mockBonds(results: { status: string; target_rate_bps: number }[]) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    Response.json({
      results: results.map(({ status, target_rate_bps }) => ({
        status,
        parameters: { target_rate_bps },
      })),
    })
  );
}

describe('fetchBondTargetRate', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns the highest rate among active bonds', async () => {
    mockBonds([
      { status: 'active', target_rate_bps: 300 },
      { status: 'active', target_rate_bps: 350 },
      { status: 'ended', target_rate_bps: 500 },
    ]);
    await expect(fetchBondTargetRate()).resolves.toEqual({ rateBps: 350, isLive: true });
  });

  it('falls back when no bond is active', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mockBonds([{ status: 'ended', target_rate_bps: 500 }]);
    await expect(fetchBondTargetRate()).resolves.toEqual({ rateBps: 300, isLive: false });
  });

  it('falls back when the request fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    await expect(fetchBondTargetRate()).resolves.toEqual({ rateBps: 300, isLive: false });
  });
});

describe('formatBondTargetRate', () => {
  it('formats basis points as a percentage', () => {
    expect(formatBondTargetRate(300)).toBe('3%');
    expect(formatBondTargetRate(325)).toBe('3.25%');
  });
});
