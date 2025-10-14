import { PresetPercentage } from '@/features/swap/swap-state/swap-state.types';
import { InputCurrencyMode } from '@/utils/types';
import { whenInputCurrencyMode } from '@/utils/when-currency-input-mode';
import BigNumber from 'bignumber.js';

import { Money } from '@leather.io/models';
import { AccountSwapAsset } from '@leather.io/services';

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

export function isUserInputEffectivelyZero(input: string) {
  return parseFloat(input) === 0;
}

export function adjustAmountForDecimals(amount: string, maxDecimals: number): string {
  if (amount === '') return amount;

  const [whole = '', decimals = ''] = amount.split('.');

  if (maxDecimals === 0 || isUserInputEffectivelyZero(amount)) return whole;
  if (decimals.length <= maxDecimals) return amount;

  const truncatedFractional = decimals.substring(0, maxDecimals);
  return truncatedFractional ? `${whole}.${truncatedFractional}` : whole;
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

export function convertMoneyToInputValue(money: Money | null): string {
  if (!money) return '';
  return money.amount
    .shiftedBy(-money.decimals)
    .toFixed(money.decimals, BigNumber.ROUND_DOWN)
    .replace(/\.0+$/, '')
    .replace(/(\.\d*?)0+$/, '$1');
}
