/* eslint-disable func-style */
import axios from 'axios';
import { inject, injectable } from 'inversify';

import { Types } from '../../../inversify.types';
import { HttpCacheService } from '../../cache/http-cache.service';
import { ApiRequestOptions } from '../types';
import {
  BnsV2ApiAddressNamesResponse,
  BnsV2ApiNameResponse,
  BnsV2ApiZoneFilResponse,
  bnsV2ApiAddressNamesResponseSchema,
  bnsV2ApiNameResponseSchema,
  bnsV2ApiZoneFileResponseSchema,
} from './bns-v2-api.schema';

const BNS_V2_API_URL = 'https://api.bnsv2.com';

@injectable()
export class BnsV2ApiClient {
  constructor(@inject(Types.CacheService) private readonly cache: HttpCacheService) {}

  public async fetchBnsName(
    fullName: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<BnsV2ApiNameResponse> {
    const fetchFn = async () => {
      const res = await axios.get<BnsV2ApiNameResponse>(`${BNS_V2_API_URL}/names/${fullName}`, {
        signal,
      });
      return bnsV2ApiNameResponseSchema.parse(res.data);
    };
    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(['bns-v2-api-name', fullName], fetchFn);
  }

  public async fetchAddressBnsNames(
    address: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<BnsV2ApiAddressNamesResponse> {
    const fetchFn = async () => {
      const res = await axios.get<BnsV2ApiAddressNamesResponse>(
        `${BNS_V2_API_URL}/names/address/${address}/valid`,
        {
          signal,
        }
      );
      return bnsV2ApiAddressNamesResponseSchema.parse(res.data);
    };
    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(['bns-v2-api-address-names', address], fetchFn);
  }

  public async fetchBnsZoneFileRaw(
    fullName: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<BnsV2ApiZoneFilResponse> {
    const fetchFn = async () => {
      const res = await axios.get<BnsV2ApiZoneFilResponse>(
        `${BNS_V2_API_URL}/zonefile/${fullName}/raw`,
        {
          signal,
        }
      );
      return bnsV2ApiZoneFileResponseSchema.parse(res.data);
    };
    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(['bns-v2-api-zone-file-raw', fullName], fetchFn);
  }
}
