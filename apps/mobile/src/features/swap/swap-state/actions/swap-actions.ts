import {
  calculatePercentageAmount,
  convertMoneyToInputValue,
} from '@/features/swap/swap-state/utils/amount-operations';
import { whenInputCurrencyMode } from '@/utils/when-currency-input-mode';

import { Money, TransactionFeeTier } from '@leather.io/models';
import { AccountSwapAsset } from '@leather.io/services';
import { createMoney } from '@leather.io/utils';

import {
  DerivedAmounts,
  PresetPercentage,
  SwapActionObject,
  SwapActions,
  SwapInternalState,
  TrackEvent,
} from '../swap-state.types';

interface CreateSwapActionsParams {
  dispatch(action: SwapActionObject): void;
  lockDerivedAmountsForNextRender(): void;
  state: SwapInternalState;
  derivedAmounts: DerivedAmounts;
  spendableAmount: Money | null;
  trackEvent: TrackEvent;
}

export function createSwapActions({
  dispatch,
  lockDerivedAmountsForNextRender,
  state,
  derivedAmounts,
  spendableAmount,
  trackEvent,
}: CreateSwapActionsParams): SwapActions {
  return {
    setBaseSwapAsset(asset: AccountSwapAsset) {
      dispatch({ type: 'SET_BASE_SWAP_ASSET', payload: asset });
      trackEvent('swap_base_asset_selected', {
        symbol: asset.asset.symbol,
        protocol: asset.asset.protocol,
      });
    },

    setTargetSwapAsset(asset: AccountSwapAsset) {
      dispatch({ type: 'SET_TARGET_SWAP_ASSET', payload: asset });
      trackEvent('swap_target_asset_selected', {
        symbol: asset.asset.symbol,
        protocol: asset.asset.protocol,
      });
    },

    setBaseAmount(amount: string) {
      dispatch({ type: 'SET_BASE_AMOUNT', payload: amount });
    },

    setBaseAmountByPercentage(percentage: PresetPercentage) {
      if (!state.baseSwapAsset?.balance || !spendableAmount) {
        return;
      }

      const { balance } = state.baseSwapAsset;

      const rate = balance.quote.availableBalance.amount.dividedBy(
        balance.crypto.availableBalance.amount
      );

      const availableBalance = whenInputCurrencyMode(state.inputCurrencyMode)({
        crypto: balance.crypto.availableBalance,
        quote: balance.quote.availableBalance,
      });

      const quoteSpendableAmount = createMoney(
        spendableAmount.amount.times(rate),
        balance.quote.availableBalance.symbol,
        balance.quote.availableBalance.decimals
      );

      const resolvedSpendableAmount = whenInputCurrencyMode(state.inputCurrencyMode)({
        crypto: spendableAmount,
        quote: quoteSpendableAmount,
      });

      const isSendingMax = percentage === 1;
      const percentageSource = isSendingMax ? resolvedSpendableAmount : availableBalance;

      dispatch({
        type: 'SET_BASE_AMOUNT',
        payload: calculatePercentageAmount(percentageSource, percentage),
      });
      const preset = percentage === 1 ? 'max' : (`${percentage * 100}%` as '25%' | '50%' | '75%');
      trackEvent('swap_amount_preset_selected', { preset });
    },

    toggleInputCurrencyMode() {
      const nextMode = whenInputCurrencyMode(state.inputCurrencyMode)({
        crypto: 'quote',
        quote: 'crypto',
      } as const);
      const nextBaseAmount = convertMoneyToInputValue(derivedAmounts[nextMode]);
      lockDerivedAmountsForNextRender();
      dispatch({
        type: 'TOGGLE_INPUT_CURRENCY_MODE',
        payload: { nextBaseAmount },
      });
      trackEvent('swap_currency_mode_toggled', { mode: nextMode });
    },

    setSlippage(slippage: number) {
      dispatch({ type: 'SET_SLIPPAGE', payload: slippage });
      trackEvent('swap_slippage_changed', { slippage: slippage * 100 });
    },

    setNonceOverride(nonce: number) {
      dispatch({ type: 'SET_NONCE_OVERRIDE', payload: nonce });
    },

    clearAssetSelection() {
      dispatch({ type: 'CLEAR_ASSET_SELECTION' });
    },

    flipAssets() {
      dispatch({ type: 'FLIP_ASSETS' });
      trackEvent('swap_assets_flipped');
    },

    openAssetSelector(type: 'base' | 'target') {
      dispatch({ type: 'OPEN_ASSET_SELECTOR', payload: type });
    },

    closeAssetSelector() {
      dispatch({ type: 'CLOSE_ASSET_SELECTOR' });
    },
    setFeeTier(tier: TransactionFeeTier) {
      dispatch({ type: 'SET_FEE_TIER', payload: tier });
      trackEvent('swap_fee_tier_selected', { tier });
    },
    setCustomFee(fee: number) {
      dispatch({ type: 'SET_CUSTOM_FEE', payload: fee });
      trackEvent('swap_custom_fee_entered', { fee });
    },
  };
}
