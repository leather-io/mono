import { stxAsset } from '@leather.io/constants';

import { useMarketDataQuery } from './market-data.query';

export function useStxMarketDataQuery() {
  return useMarketDataQuery(stxAsset);
}
