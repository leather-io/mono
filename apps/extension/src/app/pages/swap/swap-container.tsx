import { stxAsset } from '@leather.io/constants';
import { SwapProvider } from '@leather.io/state/swap';

import { analytics } from '@shared/utils/analytics';

import { HasChildren } from '@app/common/has-children';

import { useSwapDependencies } from './hooks/use-swap-dependencies';

export function SwapContainer({ children }: HasChildren) {
  const dependencies = useSwapDependencies();

  return (
    <SwapProvider
      baseAsset={stxAsset}
      dependencies={dependencies}
      quoteCurrencyPreference="USD"
      trackEvent={analytics.track}
    >
      {children}
    </SwapProvider>
  );
}
