import { describe, expect, test } from 'vitest';

import { FeeTypes } from '@leather.io/models';

import { getSbtcSponsorshipFeeSats, getSbtcSponsorshipFeeTier } from './sbtc-sponsorship.utils';

const quote = { satsPerStx: '512.5', minFeeSats: 1000, maxFeeSats: 50_000 };

describe(getSbtcSponsorshipFeeSats.name, () => {
  test('converts the micro-STX fee at the quoted rate, rounding up', () => {
    expect(getSbtcSponsorshipFeeSats(3_000_000, quote)).toBe(1538);
  });

  test('accepts the fee as a string', () => {
    expect(getSbtcSponsorshipFeeSats('3000000', quote)).toBe(1538);
  });

  test('clamps a fee below the quote minimum up to the minimum', () => {
    expect(getSbtcSponsorshipFeeSats(500, quote)).toBe(quote.minFeeSats);
  });

  test('clamps a fee above the quote maximum down to the maximum', () => {
    expect(getSbtcSponsorshipFeeSats(1_000_000_000, quote)).toBe(quote.maxFeeSats);
  });
});

describe(getSbtcSponsorshipFeeTier.name, () => {
  test('maps the form fee types to the STX fee estimate tiers', () => {
    expect(getSbtcSponsorshipFeeTier(FeeTypes[FeeTypes.Low])).toBe('low');
    expect(getSbtcSponsorshipFeeTier(FeeTypes[FeeTypes.Middle])).toBe('standard');
    expect(getSbtcSponsorshipFeeTier(FeeTypes[FeeTypes.High])).toBe('high');
  });

  test('falls back to the standard tier for custom or unknown fee types', () => {
    expect(getSbtcSponsorshipFeeTier(FeeTypes[FeeTypes.Custom])).toBe('standard');
    expect(getSbtcSponsorshipFeeTier(FeeTypes[FeeTypes.Unknown])).toBe('standard');
  });
});
