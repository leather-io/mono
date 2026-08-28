import { useMatch } from 'react-router';

import { stxAsset } from '@leather.io/constants';
import { SwappableFungibleCryptoAsset } from '@leather.io/models';
import {
  DisabledPairRule,
  SwapDependencies,
  isBaseEntirelyDisabled,
  isPairDisabled,
  useAccountBaseSwapAssetsQuery,
  useAccountTargetSwapAssetsQuery,
} from '@leather.io/state/swap';
import { getAssetId } from '@leather.io/utils';

import { RouteUrls, toRoutePattern } from '@shared/route-urls';

import { findSwapAssetByRouteParam, matchNativeAssetBySymbol } from '../swap-utils';

const swapRoutePattern = toRoutePattern(RouteUrls.Swap);
const swapRouteMatchPattern = { path: swapRoutePattern, end: false };

interface UseSwapRouteAssetsParams {
  dependencies: SwapDependencies;
  disabledPairs: DisabledPairRule[];
  enabled?: boolean;
}

export type SwapRouteAssets =
  | { status: 'loading' }
  | {
      status: 'ready';
      baseAsset: SwappableFungibleCryptoAsset;
      targetAsset?: SwappableFungibleCryptoAsset;
    };

interface AssetResolution {
  done: boolean;
  asset?: SwappableFungibleCryptoAsset;
}

export function useSwapRouteAssets({
  dependencies,
  disabledPairs,
  enabled = true,
}: UseSwapRouteAssetsParams): SwapRouteAssets {
  const routeMatch = useMatch(swapRouteMatchPattern);
  const { accountRequest } = dependencies;
  const { swapService } = dependencies.services;

  const baseParam = routeMatch?.params.base || undefined;
  const quoteParam = routeMatch?.params.quote || undefined;

  const baseAssetsQuery = useAccountBaseSwapAssetsQuery({
    swapService,
    accountRequest,
    disabledPairs,
    enabled,
  });

  const baseResolution: AssetResolution = (() => {
    if (!baseParam) return { done: true, asset: stxAsset };
    const nativeAsset = matchNativeAssetBySymbol(baseParam);
    if (nativeAsset) {
      if (isBaseEntirelyDisabled(getAssetId(nativeAsset), disabledPairs)) {
        return { done: true, asset: stxAsset };
      }
      return { done: true, asset: nativeAsset };
    }
    if (baseAssetsQuery.isPending) return { done: false };
    const match = findSwapAssetByRouteParam(baseAssetsQuery.data ?? [], baseParam);
    return { done: true, asset: match?.asset ?? stxAsset };
  })();

  const needsTargetAssetList = Boolean(quoteParam && !matchNativeAssetBySymbol(quoteParam));
  const targetAssetsQuery = useAccountTargetSwapAssetsQuery({
    swapService,
    accountRequest,
    baseId:
      needsTargetAssetList && baseResolution.done && baseResolution.asset
        ? getAssetId(baseResolution.asset)
        : undefined,
    disabledPairs,
    enabled,
  });

  const targetResolution: AssetResolution = (() => {
    if (!quoteParam) return { done: true };
    const nativeAsset = matchNativeAssetBySymbol(quoteParam);
    if (nativeAsset) {
      if (!baseResolution.done) return { done: false };
      if (
        baseResolution.asset &&
        isPairDisabled(getAssetId(baseResolution.asset), getAssetId(nativeAsset), disabledPairs)
      ) {
        return { done: true };
      }
      return { done: true, asset: nativeAsset };
    }
    if (!baseResolution.done) return { done: false };
    if (targetAssetsQuery.isPending) return { done: false };
    const match = findSwapAssetByRouteParam(targetAssetsQuery.data ?? [], quoteParam);
    return { done: true, asset: match?.asset };
  })();

  if (!baseResolution.done || !baseResolution.asset || !targetResolution.done) {
    return { status: 'loading' };
  }

  return {
    status: 'ready',
    baseAsset: baseResolution.asset,
    targetAsset: targetResolution.asset,
  };
}
