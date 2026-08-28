import { describe, expect, test } from 'vitest';

import { btcAsset, stxAsset } from '@leather.io/constants';
import { AccountSwapAsset } from '@leather.io/services';

import {
  findSwapAssetByRouteParam,
  getSwapRouteChain,
  isSigningCancelledError,
  matchNativeAssetBySymbol,
  toSwapRouteParam,
} from './swap-utils';

const sbtcSwapAsset = {
  asset: { protocol: 'sip10', symbol: 'sBTC', assetId: 'SP1.sbtc-token::sbtc-token' },
  providerAssets: [],
} as unknown as AccountSwapAsset;

const copycatSwapAsset = {
  asset: { protocol: 'sip10', symbol: 'sBTC', assetId: 'SP2.fake-sbtc::sbtc-token' },
  providerAssets: [],
} as unknown as AccountSwapAsset;

describe(matchNativeAssetBySymbol.name, () => {
  test('matches STX and BTC case-insensitively', () => {
    expect(matchNativeAssetBySymbol('STX')).toEqual(stxAsset);
    expect(matchNativeAssetBySymbol('stx')).toEqual(stxAsset);
    expect(matchNativeAssetBySymbol('btc')).toEqual(btcAsset);
  });

  test('returns undefined for other symbols and missing values', () => {
    expect(matchNativeAssetBySymbol('sBTC')).toBeUndefined();
    expect(matchNativeAssetBySymbol(undefined)).toBeUndefined();
    expect(matchNativeAssetBySymbol('')).toBeUndefined();
  });
});

describe(findSwapAssetByRouteParam.name, () => {
  test('matches by serialized asset id regardless of list order', () => {
    expect(
      findSwapAssetByRouteParam(
        [copycatSwapAsset, sbtcSwapAsset],
        'sip10|SP1.sbtc-token::sbtc-token'
      )
    ).toBe(sbtcSwapAsset);
  });

  test('matches a percent-encoded asset id', () => {
    expect(
      findSwapAssetByRouteParam([sbtcSwapAsset], 'sip10%7CSP1.sbtc-token%3A%3Asbtc-token')
    ).toBe(sbtcSwapAsset);
  });

  test('falls back to a unique symbol match case-insensitively', () => {
    expect(findSwapAssetByRouteParam([sbtcSwapAsset], 'SBTC')).toBe(sbtcSwapAsset);
    expect(findSwapAssetByRouteParam([sbtcSwapAsset], 'sbtc')).toBe(sbtcSwapAsset);
  });

  test('returns undefined when no asset matches the symbol', () => {
    expect(findSwapAssetByRouteParam([sbtcSwapAsset], 'USDA')).toBeUndefined();
    expect(findSwapAssetByRouteParam([], 'sBTC')).toBeUndefined();
  });

  test('returns undefined for an ambiguous symbol', () => {
    expect(findSwapAssetByRouteParam([sbtcSwapAsset, copycatSwapAsset], 'sBTC')).toBeUndefined();
  });

  test('returns undefined for an unknown asset id', () => {
    expect(findSwapAssetByRouteParam([sbtcSwapAsset], 'sip10|SP3.other::other')).toBeUndefined();
  });
});

describe(toSwapRouteParam.name, () => {
  test('uses the symbol for native assets', () => {
    expect(toSwapRouteParam(btcAsset)).toBe('BTC');
    expect(toSwapRouteParam(stxAsset)).toBe('STX');
  });

  test('uses the serialized asset id for sip10 assets', () => {
    expect(toSwapRouteParam(sbtcSwapAsset.asset)).toBe('sip10|SP1.sbtc-token::sbtc-token');
  });
});

describe(getSwapRouteChain.name, () => {
  test('maps assets to their route chain segment', () => {
    expect(getSwapRouteChain(btcAsset)).toBe('bitcoin');
    expect(getSwapRouteChain(stxAsset)).toBe('stacks');
  });
});

describe(isSigningCancelledError.name, () => {
  test('returns true for the ledger signing cancellation error', () => {
    expect(isSigningCancelledError(new Error('User cancelled the signing operation'))).toBe(true);
  });

  test('returns false for other errors', () => {
    expect(isSigningCancelledError(new Error('broadcast failed'))).toBe(false);
  });

  test('returns false for non-error values', () => {
    expect(isSigningCancelledError('Signing cancelled')).toBe(false);
    expect(isSigningCancelledError(undefined)).toBe(false);
  });
});
