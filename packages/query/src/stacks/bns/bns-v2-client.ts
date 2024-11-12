import axios from 'axios';

import { bitcoinNetworkModeToCoreNetworkMode } from '@leather.io/bitcoin';
import { BNS_V2_API_BASE_URL } from '@leather.io/models';
import { whenNetwork } from '@leather.io/utils';

import { useLeatherNetwork } from '../../leather-query-provider';
import {
  BnsV2NamesByAddressResponse,
  BnsV2ZoneFileDataResponse,
  bnsV2NamesByAddressSchema,
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
      return bnsV2NamesByAddressSchema.parse(resp.data);
    },
    async getZoneFileData(bnsName: string, signal?: AbortSignal) {
      const resp = await axios.get<BnsV2ZoneFileDataResponse>(
        `${basePath}/resolve-name/${bnsName}`,
        { signal }
      );
      return bnsV2ZoneFileDataSchema.parse(resp.data.zonefile);
    },
  };
}

export function useBnsV2Client() {
  const network = useLeatherNetwork();
  const basePath = whenNetwork(bitcoinNetworkModeToCoreNetworkMode(network.chain.bitcoin.mode))({
    mainnet: BNS_V2_API_BASE_URL,
    // TODO: Add testnet support if there will be a testnet BNSv2 API
    testnet: BNS_V2_API_BASE_URL,
  });
  return bnsV2Client(basePath);
}
