import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { CryptoCurrency } from '@leather.io/models';

import { marketDataQueryOptions } from '../market-data.query';

async function fetchBinanceMarketData(currency: CryptoCurrency) {
  const resp = await axios.get(
    `https://api1.binance.com/api/v3/ticker/price?symbol=${currency}USDT`
  );
  return resp.data;
}

export function selectBinanceUsdPrice(resp: any) {
  return resp?.price;
}

export function useBinanceMarketDataQuery(currency: CryptoCurrency) {
  return useQuery({
    queryFn: () => fetchBinanceMarketData(currency),
    queryKey: [`binance-market-data-${currency}`],
    ...marketDataQueryOptions,
  });
}
