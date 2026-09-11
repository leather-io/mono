/* eslint-disable func-style */
import axios from 'axios';
import { inject, injectable } from 'inversify';

import {
  BNS_V2_API_BASE_URL_MAINNET,
  BNS_V2_API_BASE_URL_TESTNET,
  NetworkModes,
} from '@leather.io/models';
import { whenNetwork } from '@leather.io/utils';

import { Types } from '../../../inversify.types';
import { HttpCacheService } from '../../cache/http-cache.service';
import { selectStacksNetworkMode } from '../../settings/settings.selectors';
import type { SettingsService } from '../../settings/settings.service';
import { ApiRequestOptions } from '../types';
import {
  BnsV2ApiAddressNamesResponse,
  BnsV2ApiNameResponse,
  BnsV2ApiZoneFilResponse,
  bnsV2ApiAddressNamesResponseSchema,
  bnsV2ApiNameResponseSchema,
  bnsV2ApiZoneFileResponseSchema,
} from './bns-v2-api.schema';

function getBnsV2ApiUrl(network: NetworkModes) {
  return whenNetwork(network)({
    mainnet: BNS_V2_API_BASE_URL_MAINNET,
    testnet: BNS_V2_API_BASE_URL_TESTNET,
  });
}

@injectable()
export class BnsV2ApiClient {
  constructor(
    @inject(Types.CacheService) private readonly cache: HttpCacheService,
    @inject(Types.SettingsService) private readonly settings: SettingsService
  ) {}

  public async fetchBnsName(
    fullName: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<BnsV2ApiNameResponse> {
    const network = selectStacksNetworkMode(this.settings.getSettings());
    const fetchFn = async () => {
      const res = await axios.get<BnsV2ApiNameResponse>(
        `${getBnsV2ApiUrl(network)}/names/${fullName}`,
        { signal }
      );
      return bnsV2ApiNameResponseSchema.parse(res.data);
    };
    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(['bns-v2-api-name', network, fullName], fetchFn);
  }

  public async fetchAddressBnsNames(
    address: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<BnsV2ApiAddressNamesResponse> {
    const network = selectStacksNetworkMode(this.settings.getSettings());
    const fetchFn = async () => {
      const res = await axios.get<BnsV2ApiAddressNamesResponse>(
        `${getBnsV2ApiUrl(network)}/names/address/${address}/valid`,
        { signal }
      );
      return bnsV2ApiAddressNamesResponseSchema.parse(res.data);
    };
    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(['bns-v2-api-address-names', network, address], fetchFn);
  }

  public async fetchBnsZoneFileRaw(
    fullName: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<BnsV2ApiZoneFilResponse> {
    const network = selectStacksNetworkMode(this.settings.getSettings());
    const fetchFn = async () => {
      const res = await axios.get<BnsV2ApiZoneFilResponse>(
        `${getBnsV2ApiUrl(network)}/zonefile/${fullName}/raw`,
        { signal }
      );
      return bnsV2ApiZoneFileResponseSchema.parse(res.data);
    };
    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(['bns-v2-api-zone-file-raw', network, fullName], fetchFn);
  }
}
