import { describe, expect, it } from 'vitest';

import {
  SBTC_ASSET_ID_MAINNET,
  SBTC_ASSET_ID_TESTNET,
  USDCX_ASSET_ID_MAINNET,
  USDCX_ASSET_ID_TESTNET,
} from '@leather.io/constants';

import { getDefaultAssetVisibilityPolicy, isAllowedByDefaultAssetVisibility } from './token-preset';

describe('getDefaultAssetVisibilityPolicy', () => {
  it('allows nothing beyond gas tokens for gasOnly', () => {
    expect(getDefaultAssetVisibilityPolicy('gasOnly')).toEqual({ type: 'allowlist', assets: [] });
  });

  it('allows sBTC and USDCx on every network for mainTokens', () => {
    expect(getDefaultAssetVisibilityPolicy('mainTokens')).toEqual({
      type: 'allowlist',
      assets: [
        `sip10|${SBTC_ASSET_ID_MAINNET}`,
        `sip10|${SBTC_ASSET_ID_TESTNET}`,
        `sip10|${USDCX_ASSET_ID_MAINNET}`,
        `sip10|${USDCX_ASSET_ID_TESTNET}`,
      ],
    });
  });

  it('uses the remote app config rule for allPricedTokens', () => {
    expect(getDefaultAssetVisibilityPolicy('allPricedTokens')).toEqual({ type: 'appConfig' });
  });
});

describe('isAllowedByDefaultAssetVisibility', () => {
  const usdcx = `sip10|${USDCX_ASSET_ID_MAINNET}` as const;

  it('allows only allowlisted assets under an allowlist policy', () => {
    expect(
      isAllowedByDefaultAssetVisibility(getDefaultAssetVisibilityPolicy('gasOnly'), usdcx)
    ).toBe(false);
    expect(
      isAllowedByDefaultAssetVisibility(getDefaultAssetVisibilityPolicy('mainTokens'), usdcx)
    ).toBe(true);
  });

  it('does not restrict anything under the app config policy', () => {
    expect(isAllowedByDefaultAssetVisibility({ type: 'appConfig' }, usdcx)).toBe(true);
  });
});
