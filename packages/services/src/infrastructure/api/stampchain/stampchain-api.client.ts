import axios from 'axios';
import { inject, injectable } from 'inversify';

import { Types } from '../../../inversify.types';
import type { HttpCacheService } from '../../cache/http-cache.service';
import { ApiRequestOptions } from '../types';
import { stampchainBalanceResponseSchema } from './stampchain-api.schema';
import { StampchainStamp } from './stampchain-api.types';

export const STAMPCHAIN_API_BASE_URL = 'https://stampchain.io';
const STAMPCHAIN_API_URL = `${STAMPCHAIN_API_BASE_URL}/api/v2`;

@injectable()
export class StampchainApiClient {
  constructor(@inject(Types.CacheService) private readonly cache: HttpCacheService) {}

  public async getStampsByAddress(
    address: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<StampchainStamp[]> {
    async function fetchFn() {
      const res = await axios.get(`${STAMPCHAIN_API_URL}/balance/${address}`, {
        signal,
        timeout: 10000,
      });

      const validated = stampchainBalanceResponseSchema.parse(res.data);
      return validated.data.stamps;
    }

    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(['stampchain-api-stamps-by-address', address], fetchFn);
  }
}
