import { useMatch } from 'react-router';

import { stxAsset } from '@leather.io/constants';
import { type SwappableFungibleCryptoAsset } from '@leather.io/models';
import { type AccountSwapAsset } from '@leather.io/services';
import {
  type DisabledPairRule,
  type SwapDependencies,
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

interface ResolveBaseAssetArgs {
  baseParam: string | undefined;
  disabledPairs: DisabledPairRule[];
  isPending: boolean;
  assets: AccountSwapAsset[] | undefined;
}

function resolveBaseAsset({
  baseParam,
  disabledPairs,
  isPending,
  assets,
}: ResolveBaseAssetArgs): AssetResolution {
  if (!baseParam) return { done: true, asset: stxAsset };
  const nativeAsset = matchNativeAssetBySymbol(baseParam);
  if (nativeAsset) {
    if (isBaseEntirelyDisabled(getAssetId(nativeAsset), disabledPairs)) {
      return { done: true, asset: stxAsset };
    }
    return { done: true, asset: nativeAsset };
  }
  if (isPending) return { done: false };
  const match = findSwapAssetByRouteParam(assets ?? [], baseParam);
  return { done: true, asset: match?.asset ?? stxAsset };
}

interface ResolveTargetAssetArgs {
  quoteParam: string | undefined;
  baseResolution: AssetResolution;
  disabledPairs: DisabledPairRule[];
  isPending: boolean;
  assets: AccountSwapAsset[] | undefined;
}

function resolveTargetAsset({
  quoteParam,
  baseResolution,
  disabledPairs,
  isPending,
  assets,
}: ResolveTargetAssetArgs): AssetResolution {
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
  if (isPending) return { done: false };
  const match = findSwapAssetByRouteParam(assets ?? [], quoteParam);
  return { done: true, asset: match?.asset };
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

  const baseResolution = resolveBaseAsset({
    baseParam,
    disabledPairs,
    isPending: baseAssetsQuery.isPending,
    assets: baseAssetsQuery.data,
  });

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

  const targetResolution = resolveTargetAsset({
    quoteParam,
    baseResolution,
    disabledPairs,
    isPending: targetAssetsQuery.isPending,
    assets: targetAssetsQuery.data,
  });

  if (!baseResolution.done || !baseResolution.asset || !targetResolution.done) {
    return { status: 'loading' };
  }

  return {
    status: 'ready',
    baseAsset: baseResolution.asset,
    targetAsset: targetResolution.asset,
  };
}
