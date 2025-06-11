import { btcAsset } from '@leather.io/constants';

import { useMarketDataQuery } from './market-data.query';

export function useBtcMarketDataQuery() {
  return useMarketDataQuery(btcAsset);
}
