import { useReducer } from 'react';

import { useSubmitSwap } from '@/features/swap/swap-state/hooks/use-submit-swap';
import { resolveNetworkFeeAsset } from '@/features/swap/swap-state/utils/asset-selection';

import { QuoteCurrency, SwappableFungibleCryptoAsset } from '@leather.io/models';
import { AccountSwapAsset } from '@leather.io/services';
import { getAssetId } from '@leather.io/utils';

import { createSwapActions } from './actions/swap-actions';
import { useDerivedAmounts } from './hooks/use-derived-amounts';
import { useIsSendingMax } from './hooks/use-is-sending-max';
import { useNetworkFee } from './hooks/use-network-fee';
import { useSecondaryAmount } from './hooks/use-secondary-amount';
import { useSpendableAmount } from './hooks/use-spendable-amount';
import { useSwapAssetReconciliation } from './hooks/use-swap-asset-reconciliation';
import { useSwapQuotes } from './hooks/use-swap-quotes';
import { useSwapValidation } from './hooks/use-swap-validation';
import { swapReducer } from './swap-state.reducer';
import {
  SwapDependencies,
  SwapInternalState,
  TrackEvent,
  UseSwapStateResult,
} from './swap-state.types';
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
  trackEvent: TrackEvent;
}

export function useSwapState({
  baseAsset,
  targetAsset,
  quoteCurrencyPreference,
  dependencies,
  trackEvent,
}: UseSwapStateProps): UseSwapStateResult {
  const { accountRequest, services } = dependencies;
  const { marketDataService, swapService } = services;

  const [state, dispatch] = useReducer(
    swapReducer,
    { baseAsset, targetAsset, quoteCurrencyPreference },
    initializeState
  );

  const spendableAmountQuery = useSpendableAmount({
    dependencies,
    baseSwapAsset: state.baseSwapAsset,
    feeTier: state.feeTier,
    customFee: state.customFee,
  });

  const baseMarketDataQuery = useAssetMarketDataQuery({
    marketDataService,
    asset: state.baseSwapAsset?.asset,
  });

  const networkFeeAssetMarkedDataQuery = useAssetMarketDataQuery({
    marketDataService,
    asset: resolveNetworkFeeAsset(state.baseSwapAsset?.asset),
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

  const effectiveNonce = state.nonceOverride ?? dependencies.stacks.nextNonce?.nonce ?? 0;

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
    derivedAmounts,
    spendableAmount: spendableAmountQuery.data ?? null,
  });

  const validation = useSwapValidation({
    state,
    derivedAmounts,
    spendableAmount: spendableAmountQuery.data ?? null,
  });

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

  const { canSubmit, submit } = useSubmitSwap({
    state,
    derivedAmounts,
    isSendingMax,
    validation,
    spendableAmountQuery,
    quoteQuery,
    networkFeeQuery,
    nonce: effectiveNonce,
    dependencies,
    trackEvent,
  });

  const actions = createSwapActions({
    dispatch,
    lockDerivedAmountsForNextRender,
    state,
    derivedAmounts,
    spendableAmount: spendableAmountQuery.data ?? null,
    trackEvent,
  });

  return {
    state: {
      ...state,
      secondaryAmount,
      assetFlippingAllowed: isAssetFlippingAllowed(state.baseSwapAsset, state.targetSwapAsset),
      isSendingMax,
      effectiveNonce,
    },
    actions,
    validation,
    baseAssetsQuery,
    targetAssetsQuery,
    networkFeeAssetMarkedDataQuery,
    baseMarketDataQuery,
    targetMarketDataQuery,
    spendableAmountQuery,
    quoteQuery,
    networkFeeQuery,
    canSubmit,
    submit,
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
    nonceOverride: undefined,
    baseAmount: '0',
    quoteCurrencyPreference,
    quotePolicy: 'best',
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
