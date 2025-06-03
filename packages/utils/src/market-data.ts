import { BigNumber } from 'bignumber.js';

import { currencyDecimalsMap, currencyNameMap } from '@leather.io/constants';
import { type MarketData, createMarketData, createMarketPair } from '@leather.io/models';

import { convertAmountToBaseUnit, convertAmountToFractionalUnit } from './money/calculate-money';
import { createMoney } from './money/format-money';

/**
 * Rebases MarketData to a different quote currency using exchange rate.
 *
 * @param marketData -  e.g. STX/USD
 * @param exchangeRate - e.g. EUR/USD (EUR is target quote currency)
 * @returns e.g. STX/EUR
 */
export function rebaseMarketData(marketData: MarketData, exchangeRate: MarketData): MarketData {
  if (exchangeRate.pair.quote !== marketData.pair.quote) {
    throw new Error(
      `Exchange rate quote currency (${exchangeRate.pair.quote}) must match original quote currency (${marketData.pair.quote})`
    );
  }

  const targetQuoteCurrency = exchangeRate.pair.base;
  if (!(targetQuoteCurrency in currencyNameMap)) {
    throw new Error(`Target currency must be a supported quote currency: ${targetQuoteCurrency}`);
  }

  const rebasedPrice = createMoney(
    convertAmountToFractionalUnit(
      marketData.price.amount.dividedBy(exchangeRate.price.amount),
      currencyDecimalsMap[targetQuoteCurrency]
    ),
    targetQuoteCurrency
  );

  return createMarketData(
    createMarketPair(marketData.pair.base, targetQuoteCurrency),
    rebasedPrice
  );
}

/**
 * Inverts exchange rate market data by swapping base/quote currencies (e.g. USD/EUR -> EUR/USD)
 */
export function invertExchangeRate(exchangeRate: MarketData): MarketData {
  if (!(exchangeRate.pair.base in currencyNameMap)) {
    throw new Error(`Base currency must be a supported quote currency: ${exchangeRate.pair.base}`);
  }

  const invertedPrice = createMoney(
    convertAmountToFractionalUnit(
      new BigNumber(1).dividedBy(convertAmountToBaseUnit(exchangeRate.price)),
      currencyDecimalsMap[exchangeRate.pair.base]
    ),
    exchangeRate.pair.base
  );

  return createMarketData(
    createMarketPair(exchangeRate.pair.quote, exchangeRate.pair.base),
    invertedPrice
  );
}
