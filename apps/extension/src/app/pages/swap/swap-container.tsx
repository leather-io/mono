import { Outlet } from 'react-router';

import { stxAsset } from '@leather.io/constants';
import {
  type LiveSwapEstimate,
  SwapProvider,
  useLiveSwapEstimate,
  useSwapContext,
} from '@leather.io/state/swap';

import { analytics } from '@shared/utils/analytics';

import { useSwapDependencies } from './hooks/use-swap-dependencies';

export interface SwapOutletContext {
  liveEstimate: LiveSwapEstimate;
}

export function SwapContainer() {
  const dependencies = useSwapDependencies();

  return (
    <SwapProvider
      baseAsset={stxAsset}
      dependencies={dependencies}
      quoteCurrencyPreference="USD"
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
