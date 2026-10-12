import { describe, expect, it } from 'vitest';

import {
  SBTC_ASSET_ID_MAINNET,
  SBTC_ASSET_ID_TESTNET,
  USDCX_ASSET_ID_MAINNET,
  USDCX_ASSET_ID_TESTNET,
} from '@leather.io/constants';

import { getDefaultAssetVisibilityPolicy } from './token-preset';

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
