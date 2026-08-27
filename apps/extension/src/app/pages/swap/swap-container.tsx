import { useRef } from 'react';
import { Navigate, Outlet } from 'react-router';

import {
  type LiveSwapEstimate,
  SwapProvider,
  useLiveSwapEstimate,
  useSwapContext,
} from '@leather.io/state/swap';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useSwapAvailability } from '@app/common/hooks/use-swap-availability';
import { LoadingSpinner } from '@app/components/loading-spinner';
import { useUserSettings } from '@app/hooks/use-user-settings';
import { useBreakOnNonCompliantEntity } from '@app/query/common/compliance-checker/compliance-checker.query';

import { useSwapDependencies } from './hooks/use-swap-dependencies';
import { useSwapDisabledPairs } from './hooks/use-swap-disabled-pairs';
import { type SwapRouteAssets, useSwapRouteAssets } from './hooks/use-swap-route-assets';

export interface SwapOutletContext {
  liveEstimate: LiveSwapEstimate;
}

export function SwapContainer() {
  const swapAvailability = useSwapAvailability();
  if (!swapAvailability.isEnabled) {
    if (swapAvailability.reason === 'loadingConfig') return <LoadingSpinner />;
    return <Navigate to={RouteUrls.Home} replace />;
  }
  return <SwapContainerContent />;
}

function SwapContainerContent() {
  useBreakOnNonCompliantEntity('sbtc_deposit');
  const dependencies = useSwapDependencies();
  const disabledPairs = useSwapDisabledPairs();
  const { quoteCurrency } = useUserSettings();
  const routeAssets = useSwapRouteAssets({ dependencies, disabledPairs });

  const initialRouteAssetsRef = useRef<Extract<SwapRouteAssets, { status: 'ready' }> | null>(null);
  if (initialRouteAssetsRef.current === null && routeAssets.status === 'ready') {
    initialRouteAssetsRef.current = routeAssets;
  }
  const initialRouteAssets = initialRouteAssetsRef.current;

  if (initialRouteAssets === null) return <LoadingSpinner />;

  return (
    <SwapProvider
      baseAsset={initialRouteAssets.baseAsset}
      targetAsset={initialRouteAssets.targetAsset}
      dependencies={dependencies}
      quoteCurrencyPreference={quoteCurrency}
      disabledPairs={disabledPairs}
      trackEvent={analytics.track}
    >
      <SwapOutlet />
    </SwapProvider>
  );
}

function SwapOutlet() {
  const { quoteQuery, networkFeeQuery, baseMarketDataQuery, networkFeeAssetMarkedDataQuery } =
    useSwapContext();

  const liveEstimate = useLiveSwapEstimate({
    quoteQuery,
    networkFeeQuery,
    baseMarketDataQuery,
    nativeAssetMarketDataQuery: networkFeeAssetMarkedDataQuery,
  });

  return <Outlet context={{ liveEstimate } satisfies SwapOutletContext} />;
}
