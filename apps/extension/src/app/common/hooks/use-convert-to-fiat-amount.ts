import { useCallback } from 'react';

import type { CryptoCurrency, Money } from '@leather.io/models';
import { baseCurrencyAmountInQuote } from '@leather.io/utils';

import { useCryptoCurrencyMarketData } from '@app/query/common/market-data/market-data.hooks';

export function useConvertCryptoCurrencyToFiatAmount(currency: CryptoCurrency) {
  // TODO: unsafe type assumption
  const cryptoCurrencyMarketData = useCryptoCurrencyMarketData(currency);

  return useCallback(
    (value: Money) => baseCurrencyAmountInQuote(value, cryptoCurrencyMarketData),
    [cryptoCurrencyMarketData]
  );
}
