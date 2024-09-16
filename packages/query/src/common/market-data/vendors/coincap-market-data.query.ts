import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { CryptoCurrency } from '@leather.io/models';

import { marketDataQueryOptions } from '../market-data.query';

const currencyNameMap: Record<CryptoCurrency, string> = {
  BTC: 'bitcoin',
  STX: 'stacks',
};

async function fetchCoincapMarketData(currency: CryptoCurrency) {
  const resp = await axios.get(`https://api.coincap.io/v2/assets/${currencyNameMap[currency]}`);
  return resp.data;
}

export function selectCoincapUsdPrice(resp: any) {
  return resp?.data?.priceUsd;
}
export function useCoincapMarketDataQuery(currency: CryptoCurrency) {
  return useQuery({
    queryFn: () => fetchCoincapMarketData(currency),
    queryKey: [`coincap-market-data-${currency}`],
    ...marketDataQueryOptions,
  });
}
