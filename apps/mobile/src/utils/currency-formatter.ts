/* eslint-disable lingui/no-unlocalized-strings */
import { captureMessage } from '@sentry/react-native';

import { Money } from '@leather.io/models';
import { FormatAmountOptions, createCurrencyFormatter, isError } from '@leather.io/utils';

const currencyFormatter = createCurrencyFormatter({
  locale: 'en-US',
  onError: (error, context) => {
    const message =
      isError(error) && error.message
        ? `Currency formatter error: ${error.message}`
        : 'Currency formatter error';

    captureMessage(message, {
      level: 'warning',
      extra: context,
    });
  },
});

export function formatCurrency(money: Money, options?: FormatAmountOptions) {
  return currencyFormatter.formatAmount(
    {
      amount: money.amount.shiftedBy(-money.decimals).toNumber(),
      currencyCode: money.symbol,
      decimals: money.decimals,
    },
    options
  );
}

export const formatPercentage = currencyFormatter.formatPercentage;
