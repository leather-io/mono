import { matchPath, useLocation } from 'react-router';

import { stxAsset } from '@leather.io/constants';
import { SwappableFungibleCryptoAsset } from '@leather.io/models';
import {
  DisabledPairRule,
  SwapDependencies,
  useAccountBaseSwapAssetsQuery,
  useAccountTargetSwapAssetsQuery,
} from '@leather.io/state/swap';
import { getAssetId } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { findSwapAssetBySymbol, matchNativeAssetBySymbol } from '../swap-utils';

const swapRoutePattern = RouteUrls.Swap.replace('{chain}', ':chain');

interface UseSwapRouteAssetsParams {
  dependencies: SwapDependencies;
  disabledPairs: DisabledPairRule[];
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
}: UseSwapRouteAssetsParams): SwapRouteAssets {
  const location = useLocation();
  const routeMatch = matchPath({ path: swapRoutePattern, end: false }, location.pathname);
  const { accountRequest } = dependencies;
  const { swapService } = dependencies.services;

  const baseParam = routeMatch?.params.base || undefined;
  const quoteParam = routeMatch?.params.quote || undefined;

  const baseAssetsQuery = useAccountBaseSwapAssetsQuery({
    swapService,
    accountRequest,
    disabledPairs,
  });

  const baseResolution: AssetResolution = (() => {
    if (!baseParam) return { done: true, asset: stxAsset };
    const nativeAsset = matchNativeAssetBySymbol(baseParam);
    if (nativeAsset) return { done: true, asset: nativeAsset };
    if (baseAssetsQuery.isPending) return { done: false };
    const match = findSwapAssetBySymbol(baseAssetsQuery.data ?? [], baseParam);
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
  });

  const targetResolution: AssetResolution = (() => {
    if (!quoteParam) return { done: true };
    const nativeAsset = matchNativeAssetBySymbol(quoteParam);
    if (nativeAsset) return { done: true, asset: nativeAsset };
    if (!baseResolution.done) return { done: false };
    if (targetAssetsQuery.isPending) return { done: false };
    const match = findSwapAssetBySymbol(targetAssetsQuery.data ?? [], quoteParam);
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
