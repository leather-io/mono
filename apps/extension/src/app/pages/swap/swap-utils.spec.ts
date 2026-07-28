import { describe, expect, test } from 'vitest';

import { btcAsset, stxAsset } from '@leather.io/constants';
import { AccountSwapAsset } from '@leather.io/services';

import {
  findSwapAssetBySymbol,
  getSwapRouteChain,
  isSigningCancelledError,
  matchNativeAssetBySymbol,
} from './swap-utils';

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

describe(findSwapAssetBySymbol.name, () => {
  const sbtcSwapAsset = {
    asset: { symbol: 'sBTC' },
    providerAssets: [],
  } as unknown as AccountSwapAsset;

  test('matches asset symbol case-insensitively', () => {
    expect(findSwapAssetBySymbol([sbtcSwapAsset], 'SBTC')).toBe(sbtcSwapAsset);
    expect(findSwapAssetBySymbol([sbtcSwapAsset], 'sbtc')).toBe(sbtcSwapAsset);
  });

  test('returns undefined when no asset matches', () => {
    expect(findSwapAssetBySymbol([sbtcSwapAsset], 'USDA')).toBeUndefined();
    expect(findSwapAssetBySymbol([], 'sBTC')).toBeUndefined();
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

  test('returns true for the software signer cancellation error', () => {
    expect(isSigningCancelledError(new Error('Signing cancelled'))).toBe(true);
  });

  test('returns false for other errors', () => {
    expect(isSigningCancelledError(new Error('broadcast failed'))).toBe(false);
  });

  test('returns false for non-error values', () => {
    expect(isSigningCancelledError('Signing cancelled')).toBe(false);
    expect(isSigningCancelledError(undefined)).toBe(false);
  });
});
