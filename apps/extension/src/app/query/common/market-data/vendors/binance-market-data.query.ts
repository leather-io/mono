import { useQuery } from '@tanstack/react-query';

import { type CryptoCurrency } from '@leather.io/models';
import { fetchBinanceMarketData, marketDataQueryOptions } from '@leather.io/query';

export function useBinanceMarketDataQuery(currency: CryptoCurrency) {
  return useQuery<unknown>({
    queryFn: () => fetchBinanceMarketData(currency),
    queryKey: [`binance-market-data-${currency}`],
    ...marketDataQueryOptions,
  });
}
