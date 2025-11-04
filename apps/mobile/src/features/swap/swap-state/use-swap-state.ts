import { useReducer } from 'react';

import { useNetworkFee } from '@/features/swap/swap-state/hooks/use-network-fee';

import { QuoteCurrency, SwappableFungibleCryptoAsset } from '@leather.io/models';
import { AccountSwapAsset } from '@leather.io/services';
import { getAssetId } from '@leather.io/utils';

import { createSwapActions } from './actions/swap-actions';
import { useDerivedAmounts } from './hooks/use-derived-amounts';
import { useIsSendingMax } from './hooks/use-is-sending-max';
import { useSecondaryAmount } from './hooks/use-secondary-amount';
import { useSwapAssetReconciliation } from './hooks/use-swap-asset-reconciliation';
import { useSwapExecutability } from './hooks/use-swap-executability';
import { useSwapQuotes } from './hooks/use-swap-quotes';
import { useSwapValidation } from './hooks/use-swap-validation';
import { swapReducer } from './swap-state.reducer';
import { SwapDependencies, SwapInternalState, UseSwapStateResult } from './swap-state.types';
import { DEFAULT_SLIPPAGE_PERCENTAGE } from './swap.constants';
import {
  useAccountBaseSwapAssetsQuery,
  useAccountTargetSwapAssetsQuery,
  useAssetMarketDataQuery,
} from './swap.queries';

export interface UseSwapStateProps {
  baseAsset?: SwappableFungibleCryptoAsset;
  targetAsset?: SwappableFungibleCryptoAsset;
  quoteCurrencyPreference: QuoteCurrency;
  dependencies: SwapDependencies;
}

export function useSwapState({
  baseAsset,
  targetAsset,
  quoteCurrencyPreference,
  dependencies,
}: UseSwapStateProps): UseSwapStateResult {
  const { accountRequest, services } = dependencies;
  const { marketDataService, swapService } = services;

  const [state, dispatch] = useReducer(
    swapReducer,
    { baseAsset, targetAsset, quoteCurrencyPreference },
    initializeState
  );

  const baseMarketDataQuery = useAssetMarketDataQuery({
    marketDataService,
    asset: state.baseSwapAsset?.asset,
  });

  const targetMarketDataQuery = useAssetMarketDataQuery({
    marketDataService,
    asset: state.targetSwapAsset?.asset,
  });

  const baseAssetsQuery = useAccountBaseSwapAssetsQuery({
    accountRequest,
    swapService,
  });

  const targetAssetsQuery = useAccountTargetSwapAssetsQuery({
    swapService,
    accountRequest,
    baseId: state.baseSwapAsset ? getAssetId(state.baseSwapAsset?.asset) : undefined,
  });

  useSwapAssetReconciliation({
    baseSwapAssets: baseAssetsQuery.data,
    targetSwapAssets: targetAssetsQuery.data,
    dispatch,
  });

  const { derivedAmounts, lockDerivedAmountsForNextRender } = useDerivedAmounts(
    state,
    baseMarketDataQuery.data
  );

  const secondaryAmount = useSecondaryAmount({
    state,
    baseMarketDataQuery,
    derivedAmounts,
  });

  const isSendingMax = useIsSendingMax({
    baseSwapAsset: state.baseSwapAsset,
    inputCurrencyMode: state.inputCurrencyMode,
    derivedAmounts,
  });

  const validation = useSwapValidation({ state, derivedAmounts });

  const { quoteQuery } = useSwapQuotes({
    swapService,
    state,
    derivedAmounts,
    baseMarketData: baseMarketDataQuery.data,
    targetMarketData: targetMarketDataQuery.data,
  });

  const networkFeeQuery = useNetworkFee({
    state,
    derivedAmounts,
    isSendingMax,
    quote: quoteQuery.data?.selected?.rawSwapQuote,
    baseAmount: derivedAmounts.crypto?.amount
      .shiftedBy(-derivedAmounts.crypto?.decimals)
      .toNumber(),
    dependencies,
  });

  const actions = createSwapActions({
    dispatch,
    lockDerivedAmountsForNextRender,
    state,
    derivedAmounts,
  });

  const isSwapExecutable = useSwapExecutability({ validation, quoteQuery, derivedAmounts });

  return {
    state: {
      ...state,
      secondaryAmount,
      assetFlippingAllowed: isAssetFlippingAllowed(state.baseSwapAsset, state.targetSwapAsset),
      isSendingMax,
    },
    actions,
    validation,
    baseAssetsQuery,
    targetAssetsQuery,
    quoteQuery,
    networkFeeQuery,
    isSwapExecutable,
  };
}

export interface InitializeStateParams {
  baseAsset?: SwappableFungibleCryptoAsset;
  targetAsset?: SwappableFungibleCryptoAsset;
  quoteCurrencyPreference: QuoteCurrency;
}

function initializeState({
  baseAsset,
  targetAsset,
  quoteCurrencyPreference,
}: InitializeStateParams): SwapInternalState {
  const baseSwapAsset = baseAsset ? { asset: baseAsset, providerAssets: [] } : null;
  const targetSwapAsset = targetAsset ? { asset: targetAsset, providerAssets: [] } : null;

  return {
    baseSwapAsset: baseSwapAsset,
    targetSwapAsset: targetSwapAsset,
    pairReconciliation: { base: 'pending', target: 'pending' },
    nonce: undefined,
    baseAmount: '0',
    quoteCurrencyPreference,
    quoteStrategy: 'best',
    inputCurrencyMode: 'crypto',
    slippage: DEFAULT_SLIPPAGE_PERCENTAGE,
    selectingAsset: null,
    feeTier: 'standard',
    customFee: null,
  };
}

function isAssetFlippingAllowed(
  baseSwapAsset: AccountSwapAsset | null,
  targetSwapAsset: AccountSwapAsset | null
) {
  return baseSwapAsset !== null && targetSwapAsset !== null;
}
