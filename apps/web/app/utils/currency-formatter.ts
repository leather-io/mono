import * as Sentry from '@sentry/react-router';

import { Money } from '@leather.io/models';
import { FormatAmountOptions, createCurrencyFormatter, isError } from '@leather.io/utils';

const currencyFormatter = createCurrencyFormatter({
  locale: 'en-US',
  onError(error, context) {
    const message =
      isError(error) && error.message
        ? `Currency formatter error: ${error.message}`
        : 'Currency formatter error';

    Sentry.captureMessage(message, {
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

// Crypto display policy (#2527):
// - BTC and BTC-pegged assets (sBTC, xBTC, …): always padded to 8 decimals,
//   everywhere — zeros carry value
// - STX and other fungible tokens: adaptive — min 2 fraction digits, capped
//   at min(token decimals, 6), trailing zeros stripped in glanceable views;
//   padded to the cap on precise surfaces (send, confirmation, tx details)
// - Tiny balances that would round to zero at the cap expand to significant
//   digits instead
// - Fiat keeps formatCurrency's defaults (2dp, <$0.01 dust floor)
const btcPaddedDecimals = 8;
const adaptiveDecimalsCap = 6;

// Stacks wrapped-bitcoin tokens conventionally carry the BTC suffix.
function isBtcDenominated(symbol: string) {
  return symbol.endsWith('BTC');
}

function cryptoFractionCap(money: Money) {
  return Math.min(money.decimals, adaptiveDecimalsCap);
}

function roundsToZeroAtCap(money: Money, cap: number) {
  const value = money.amount.shiftedBy(-money.decimals);
  return value.isGreaterThan(0) && value.shiftedBy(cap).isLessThan(1);
}

export function formatCryptoGlanceable(money: Money, options?: FormatAmountOptions) {
  if (isBtcDenominated(money.symbol)) return formatCryptoPrecise(money, options);
  const cap = cryptoFractionCap(money);
  if (roundsToZeroAtCap(money, cap)) {
    return formatCurrency(money, {
      ...options,
      numberFormatOptions: { maximumSignificantDigits: 2 },
    });
  }
  return formatCurrency(money, {
    ...options,
    numberFormatOptions: { minimumFractionDigits: 2, maximumFractionDigits: cap },
  });
}

export function formatCryptoPrecise(money: Money, options?: FormatAmountOptions) {
  const padTo = isBtcDenominated(money.symbol)
    ? Math.min(btcPaddedDecimals, money.decimals)
    : cryptoFractionCap(money);
  return formatCurrency(money, {
    ...options,
    numberFormatOptions: { minimumFractionDigits: padTo, maximumFractionDigits: padTo },
  });
}
