import type { Activity, Money } from '@leather.io/models';
import { type FormatAmountOptions, minusSign } from '@leather.io/utils';

import type { ActivityBalances } from './types';

export type FormatMoney = (money: Money, options?: FormatAmountOptions) => string;

export function addOperator(balance: string, operator?: string) {
  return operator ? `${operator} ${balance}` : balance;
}

export function getBalanceOperator(activity: Activity) {
  if (activity.type === 'receiveAsset') return '+';
  if (activity.type === 'sendAsset') return minusSign;
  return undefined;
}

export function getBalanceColor(activity: Activity) {
  if (activity.type === 'receiveAsset' && 'status' in activity && activity.status === 'success')
    return 'green.action-primary-default';
  return 'ink.text-primary';
}

export function getBalancesText(activity: Activity, formatMoney: FormatMoney) {
  if (activity.type === 'swapAssets') {
    const formattedToBalanceCrypto =
      activity.toValue?.crypto && addOperator(formatMoney(activity.toValue?.crypto), '+');
    const formattedToBalanceQuote =
      activity.toValue?.quote && addOperator(formatMoney(activity.toValue?.quote), '+');

    return {
      formattedBalanceCrypto: formattedToBalanceCrypto,
      formattedBalanceQuote: formattedToBalanceQuote,
    };
  }

  if (!('value' in activity))
    return {
      formattedBalanceCrypto: '',
      formattedBalanceQuote: '',
    };
  const formattedBalanceCrypto =
    activity.value?.crypto &&
    addOperator(formatMoney(activity.value?.crypto), getBalanceOperator(activity));
  const formattedBalanceQuote =
    activity.value?.quote &&
    addOperator(formatMoney(activity.value?.quote), getBalanceOperator(activity));

  return {
    formattedBalanceCrypto,
    formattedBalanceQuote,
  };
}

export function getActivityBalances(activity: Activity): ActivityBalances {
  if (activity.type === 'swapAssets') {
    return {
      operator: '+',
      crypto: activity.toValue?.crypto,
      quote: activity.toValue?.quote,
      color: getBalanceColor(activity),
    };
  }

  if (!('value' in activity)) return {};

  return {
    operator: getBalanceOperator(activity),
    crypto: activity.value?.crypto,
    quote: activity.value?.quote,
    color: getBalanceColor(activity),
  };
}
