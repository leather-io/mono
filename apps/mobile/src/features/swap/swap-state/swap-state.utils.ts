import {
  SupportedProtocol,
  getProtocolStrategy,
} from '@/features/swap/strategies/protocol/protocol';
import {
  PresetPercentage,
  SecondaryAmount,
  SupportedAsset,
  SwapInternalState,
} from '@/features/swap/swap-state/swap-state.types';
import { InputCurrencyMode } from '@/utils/types';
import { whenInputCurrencyMode } from '@/utils/when-currency-input-mode';
import BigNumber from 'bignumber.js';
import { filter, pipe, sortBy } from 'remeda';

import {
  CryptoAssetBalance,
  MarketData,
  Money,
  isBtcAsset,
  isSip10Asset,
  isStxAsset,
} from '@leather.io/models';
import { AccountSwapAsset } from '@leather.io/services';

export function convertMoneyToInputValue(money: Money | null): string {
  if (!money) return '';
  return money.amount
    .shiftedBy(-money.decimals)
    .toFixed(money.decimals, BigNumber.ROUND_DOWN)
    .replace(/\.0+$/, '')
    .replace(/(\.\d*?)0+$/, '$1');
}

export function isUserInputEffectivelyZero(input: string) {
  return parseFloat(input) === 0;
}

export function calculatePercentageAmount(
  balance: Money | undefined,
  percentage: PresetPercentage
): string {
  if (!balance) return '0';

  return balance.amount
    .multipliedBy(percentage)
    .shiftedBy(-balance.decimals)
    .toFixed(balance.decimals, BigNumber.ROUND_DOWN)
    .replace(/\.0+$/, '')
    .replace(/(\.\d*?)0+$/, '$1');
}

export function adjustAmountForDecimals(amount: string, maxDecimals: number): string {
  if (amount === '') return amount;

  const [whole = '', decimals = ''] = amount.split('.');

  if (maxDecimals === 0 || isUserInputEffectivelyZero(amount)) return whole;
  if (decimals.length <= maxDecimals) return amount;

  const truncatedFractional = decimals.substring(0, maxDecimals);
  return truncatedFractional ? `${whole}.${truncatedFractional}` : whole;
}

interface ComputeSecondaryAmountStateParams {
  state: SwapInternalState;
  queryStatus: 'pending' | 'success' | 'error';
  isFetching: boolean;
  derivedAmounts: { crypto: Money | null; quote: Money | null };
}

export function computeSecondaryAmountState({
  state,
  queryStatus,
  isFetching,
  derivedAmounts,
}: ComputeSecondaryAmountStateParams): SecondaryAmount {
  if (!state.baseSwapAsset) {
    return { status: 'idle', value: null };
  }

  if (queryStatus === 'pending') {
    return { status: 'pending', value: null };
  }

  const secondaryValue = whenInputCurrencyMode(state.inputCurrencyMode)({
    crypto: derivedAmounts.quote,
    quote: derivedAmounts.crypto,
  });

  if (queryStatus === 'error' || (queryStatus === 'success' && secondaryValue === null)) {
    return { status: 'error', value: null };
  }

  if (queryStatus === 'success' && secondaryValue !== null) {
    return { status: 'success', value: secondaryValue, isFetching };
  }

  return { status: 'idle', value: null };
}

export function createSwapAssetsSelector(
  assetSelectionType: 'base' | 'target',
  isAssetAllowed?: (asset: SupportedAsset) => boolean
) {
  return (data: AccountSwapAsset[]): AccountSwapAsset[] => {
    return pipe(
      data,
      filter(swapAsset => isRelevantSwapAsset(swapAsset, assetSelectionType, isAssetAllowed)),
      sortBy(
        getCurrencyPriority,
        swapAsset => -getAvailableQuoteBalance(swapAsset),
        swapAsset => swapAsset.asset.symbol
      )
    );
  };
}

function isRelevantSwapAsset(
  swapAsset: AccountSwapAsset,
  type: 'base' | 'target',
  isAssetAllowed?: (asset: SupportedAsset) => boolean
) {
  if (isAssetAllowed && !isAssetAllowed(swapAsset.asset)) {
    return false;
  }

  if (type === 'base') {
    return hasPositiveCryptoBalance(swapAsset) || isAllowedZeroBalanceAsset(swapAsset.asset);
  }

  return true;
}

function getCurrencyPriority(swapAsset: AccountSwapAsset): number {
  if (isBtcAsset(swapAsset.asset)) return 0;
  if (isStxAsset(swapAsset.asset)) return 1;
  if (isSip10Asset(swapAsset.asset) && swapAsset.asset.symbol === 'sBTC') return 2;
  return 3;
}

function getAvailableQuoteBalance(swapAsset: AccountSwapAsset): number {
  return swapAsset.balance?.quote.availableBalance.amount.toNumber() ?? 0;
}

function hasPositiveCryptoBalance(swapAsset: AccountSwapAsset): boolean {
  const cryptoBalance = swapAsset.balance?.crypto.availableBalance.amount.toNumber() ?? 0;
  return cryptoBalance > 0;
}

function isAllowedZeroBalanceAsset(asset: SupportedAsset) {
  return isBtcAsset(asset) || isStxAsset(asset);
}

export function isAmountEqualToAvailableBalance(
  derivedAmounts: { crypto: Money | null; quote: Money | null },
  baseSwapAsset: AccountSwapAsset | null,
  inputCurrencyMode: InputCurrencyMode
): boolean {
  if (!baseSwapAsset?.balance) return false;

  const currentAmount = whenInputCurrencyMode(inputCurrencyMode)({
    crypto: derivedAmounts.crypto,
    quote: derivedAmounts.quote,
  });

  if (!currentAmount) return false;

  const availableBalance = whenInputCurrencyMode(inputCurrencyMode)({
    crypto: baseSwapAsset.balance.crypto.availableBalance,
    quote: baseSwapAsset.balance.quote.availableBalance,
  });

  return currentAmount.amount.isEqualTo(availableBalance.amount);
}

export function calculatePriceImpactPercentage(
  quotedRate: number,
  fairMarketRate: number | null
): number | null {
  if (fairMarketRate === null || fairMarketRate === 0 || quotedRate === 0) return null;

  const priceImpact = new BigNumber(fairMarketRate)
    .minus(quotedRate)
    .div(fairMarketRate)
    .toNumber();

  return Math.max(0, priceImpact);
}

interface CalculateFairMarketRateParams {
  baseMarketData: MarketData | null | undefined;
  targetMarketData: MarketData | null | undefined;
}

export function calculateFairMarketRate({
  baseMarketData,
  targetMarketData,
}: CalculateFairMarketRateParams): number | null {
  if (!baseMarketData || !targetMarketData) return null;
  if (!baseMarketData.price || !targetMarketData.price) return null;

  const basePrice = baseMarketData.price.amount;
  const targetPrice = targetMarketData.price.amount;

  if (basePrice.isZero() || targetPrice.isZero()) return null;

  return basePrice.div(targetPrice).toNumber();
}

export function estimateExchangeRate(baseAmount: number, targetAmount: number): number {
  const base = new BigNumber(baseAmount);
  if (base.isZero()) return 0;
  return new BigNumber(targetAmount).div(base).toNumber();
}

export function resolveSpendableBalanceInCurrencyMode(
  balance: { crypto: CryptoAssetBalance; quote: CryptoAssetBalance } | undefined,
  protocol: SupportedProtocol | undefined,
  inputCurrencyMode: InputCurrencyMode
): Money | null {
  if (!balance || !protocol) return null;

  const { resolveSpendableBalance: resolve } = getProtocolStrategy(protocol);
  const selectedBalance = whenInputCurrencyMode(inputCurrencyMode)({
    crypto: balance.crypto,
    quote: balance.quote,
  });

  return resolve(selectedBalance);
}

export function resolveMinimumSpendAmount(protocol: SupportedProtocol | undefined): number {
  if (!protocol) return 0;
  return getProtocolStrategy(protocol).getMinimumSpendAmount();
}

export function resolveMaximumSpendAmount(protocol: SupportedProtocol | undefined): number {
  if (!protocol) return Number.POSITIVE_INFINITY;
  return getProtocolStrategy(protocol).getMaximumSpendAmount();
}
