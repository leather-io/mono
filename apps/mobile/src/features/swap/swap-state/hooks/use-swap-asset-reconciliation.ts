import { useEffect } from 'react';

import { AccountSwapAsset } from '@leather.io/services';

import { SwapActionObject } from '../swap-state.types';

interface UseSwapAssetsParams {
  baseSwapAssets?: AccountSwapAsset[];
  targetSwapAssets?: AccountSwapAsset[];
  dispatch(action: SwapActionObject): void;
}

export function useSwapAssetReconciliation({
  baseSwapAssets,
  targetSwapAssets,
  dispatch,
}: UseSwapAssetsParams) {
  useEffect(() => {
    if (baseSwapAssets) {
      dispatch({ type: 'RECONCILE_BASE_WITH_PROVIDER', payload: baseSwapAssets });
    }
  }, [baseSwapAssets, dispatch]);

  useEffect(() => {
    if (targetSwapAssets) {
      dispatch({ type: 'RECONCILE_TARGET_WITH_PROVIDER', payload: targetSwapAssets });
    }
  }, [targetSwapAssets, dispatch]);
}
