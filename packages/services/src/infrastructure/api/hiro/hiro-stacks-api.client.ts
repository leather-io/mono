import type { Transaction } from '@stacks/stacks-blockchain-api-types';
import axios from 'axios';

import { HttpCacheService } from '../../cache/http-cache.service';
import { HttpCacheTimeMs } from '../../cache/http-cache.utils';

interface HiroPaginatedResponse<T> {
  limit: number;
  offset: number;
  total: number;
  results: T;
}

export type HiroAddressTransactionsResponse = HiroPaginatedResponse<Transaction>;

export interface HiroStacksApiClient {
  getAddressTransactions(
    address: string,
    signal?: AbortSignal
  ): Promise<HiroAddressTransactionsResponse>;
}

export function createHiroStacksApiClient(cache: HttpCacheService) {
  async function getAddressTransactions(address: string, signal?: AbortSignal) {
    return await cache.fetchWithCache<HiroAddressTransactionsResponse>(
      ['hiro-stacks-address-transactions', address],
      async () => {
        const res = await axios.get(``, { signal });
        return res.data;
      },
      { ttl: HttpCacheTimeMs.fiveMinutes }
    );
  }

  return {
    getAddressTransactions,
  };
}
