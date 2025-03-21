import axios from 'axios';

import { BNS_V2_API_BASE_URL } from '@leather.io/models';

import {
  BnsV2NameDataByNameResponse,
  BnsV2NamesByAddressResponse,
  BnsV2ZoneFileDataResponse,
  bnsV2NameDataByNameResponseSchema,
  bnsV2NamesByAddressResponseSchema,
  bnsV2ZoneFileDataSchema,
} from './bns.schemas';

export type BnsV2Client = ReturnType<typeof bnsV2Client>;

/**
 * @see https://bnsv2.com/docs
 */
export function bnsV2Client(basePath = BNS_V2_API_BASE_URL) {
  return {
    async getNamesByAddress(address: string, signal?: AbortSignal) {
      const resp = await axios.get<BnsV2NamesByAddressResponse>(
        `${basePath}/names/address/${address}/valid`,
        { signal }
      );
      return bnsV2NamesByAddressResponseSchema.parse(resp.data);
    },
    async getZoneFileData(bnsName: string, signal?: AbortSignal) {
      const resp = await axios.get<BnsV2ZoneFileDataResponse>(
        `${basePath}/resolve-name/${bnsName}`,
        { signal }
      );
      return bnsV2ZoneFileDataSchema.parse(resp.data.zonefile);
    },
    async getBnsNameDataByName(bnsName: string, signal?: AbortSignal) {
      const resp = await axios.get<BnsV2NameDataByNameResponse>(`${basePath}/names/${bnsName}`, {
        signal,
      });
      return bnsV2NameDataByNameResponseSchema.parse(resp.data);
    },
  };
}
