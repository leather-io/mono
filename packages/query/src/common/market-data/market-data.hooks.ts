import { useCallback, useMemo } from 'react';

import {
  CryptoCurrencies,
  MarketData,
  Money,
  createMarketData,
  createMarketPair,
  createMoney,
  currencyDecimalsMap,
} from '@leather-wallet/models';
import {
  baseCurrencyAmountInQuote,
  calculateMeanAverage,
  convertAmountToFractionalUnit,
} from '@leather-wallet/utils';
import BigNumber from 'bignumber.js';

import {
  selectBinanceUsdPrice,
  useBinanceMarketDataQuery,
} from './vendors/binance-market-data.query';
import {
  selectCoincapUsdPrice,
  useCoincapMarketDataQuery,
} from './vendors/coincap-market-data.query';
import {
  selectCoingeckoUsdPrice,
  useCoinGeckoMarketDataQuery,
} from './vendors/coingecko-market-data.query';

interface MarketDataVendorWithPriceSelector {
  result: unknown;
  selector(v: unknown): string | number;
}
function pullPriceDataFromAvailableResponses(responses: MarketDataVendorWithPriceSelector[]) {
  return responses
    .filter(({ result }) => !!result)
    .map(({ result, selector: priceSelector }) => priceSelector(result))
    .map(val => new BigNumber(val))
    .map(val => convertAmountToFractionalUnit(val, currencyDecimalsMap.USD));
}

export function useCryptoCurrencyMarketData(currency: CryptoCurrencies): MarketData {
  const { data: coingecko } = useCoinGeckoMarketDataQuery(currency);
  const { data: coincap } = useCoincapMarketDataQuery(currency);
  const { data: binance } = useBinanceMarketDataQuery(currency);

  return useMemo(() => {
    const priceData = pullPriceDataFromAvailableResponses([
      { result: coingecko, selector: selectCoingeckoUsdPrice },
      { result: coincap, selector: selectCoincapUsdPrice },
      { result: binance, selector: selectBinanceUsdPrice },
    ]);
    const meanPrice = calculateMeanAverage(priceData);

    return createMarketData(createMarketPair(currency, 'USD'), createMoney(meanPrice, 'USD'));
  }, [binance, coincap, coingecko, currency]);
}

export function useCalculateBitcoinFiatValue() {
  const btcMarketData = useCryptoCurrencyMarketData('BTC');

  return useCallback(
    (value: Money) => baseCurrencyAmountInQuote(value, btcMarketData),
    [btcMarketData]
  );
}
