import { describe, expect, it } from 'vitest';

import { SBTC_ASSET_ID_TESTNET, USDCX_ASSET_ID_MAINNET } from '@leather.io/constants';

import { resolveSip10Visibility } from './sip10-visibility';

const alex = 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex::alex';

describe('resolveSip10Visibility', () => {
  it('shows allowlisted assets on every network by default', () => {
    expect(resolveSip10Visibility({}, USDCX_ASSET_ID_MAINNET)).toBe(true);
    expect(resolveSip10Visibility({}, SBTC_ASSET_ID_TESTNET)).toBe(true);
  });

  it('hides other assets by default', () => {
    expect(resolveSip10Visibility({}, alex)).toBe(false);
  });

  it('lets an explicit user setting override the default', () => {
    expect(
      resolveSip10Visibility({ [`sip10|${USDCX_ASSET_ID_MAINNET}`]: false }, USDCX_ASSET_ID_MAINNET)
    ).toBe(false);
    expect(resolveSip10Visibility({ [`sip10|${alex}`]: true }, alex)).toBe(true);
  });
});
