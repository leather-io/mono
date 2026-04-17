import axios from 'axios';
import { z } from 'zod';

import { WalletDefaultNetworkConfigurationIds } from '@leather.io/models';

import {
  bestInSlotInscriptionSchema,
  bestInslotInscriptionBatchInfoSchema,
  inscriptionsByAddressSchema,
} from './zod-schemas';

export type BestInSlotInscriptionResponse = z.infer<typeof bestInSlotInscriptionSchema>;
export type BestinSlotInscriptionBatchInfoResponse = z.infer<
  typeof bestInslotInscriptionBatchInfoSchema
>;

export interface BestInSlotInscriptionByXpubResponse {
  data: BestInSlotInscriptionResponse[];
  block_height: number;
}

export interface BestInSlotInscriptionByIdResponse {
  data: BestInSlotInscriptionResponse;
  block_height: number;
}

export interface BestInSlotInscriptionsByTxIdResponse {
  data: { inscription_id: string }[];
  blockHeight: number;
}

export interface BestInSlotInscriptionsBatchInfoResponse {
  data: { query: string; result: BestinSlotInscriptionBatchInfoResponse[] | null }[];
}

interface BestInSlotInscriptionByAddressDefaultArgs {
  network?: WalletDefaultNetworkConfigurationIds;
  sortBy?: 'inscr_num';
  order?: 'asc' | 'desc';
  offset?: number;
  count?: number;
  signal?: AbortSignal;
  exclude_brc20?: boolean;
  cursed_only?: boolean;
}

interface BestInSlotInscriptionByAddressArgs extends BestInSlotInscriptionByAddressDefaultArgs {
  address: string;
}

interface BestInSlotInscriptionByAddressesArgs extends BestInSlotInscriptionByAddressDefaultArgs {
  addresses: string[];
}

export interface BestInSlotInscriptionByAddressResponse {
  block_height: number;
  data: BestInSlotInscriptionsByTxIdResponse[];
}

const emptyBestInSlotInscription: BestInSlotInscriptionResponse = {
  inscription_id: '',
  inscription_number: 0,
  parent_ids: [],
  metadata: null,
  owner_wallet_addr: '',
  satpoint: '',
  genesis_height: 0,
  content_url: '',
  bis_url: '',
  output_value: 0,
  genesis_ts: '',
  genesis_block_hash: '',
};

interface BestInSlotApiOptions {
  isOrdinalsActive?: boolean;
}

export function BestInSlotApi(basePath: string, options: BestInSlotApiOptions = {}) {
  async function withOrdinalsFallback<T>(request: () => Promise<T>, fallbackValue: T): Promise<T> {
    if (options.isOrdinalsActive !== false) return request();
    try {
      return await request();
    } catch {
      return fallbackValue;
    }
  }

  /**
   * @see https://docs.bestinslot.xyz/reference/api-reference/ordinals-and-brc-20-and-runes-and-bitmap-v3-api-mainnet+testnet+signet/wallets#get-wallet-inscriptions
   */
  async function getInscriptionsByAddress({
    address,
    sortBy = 'inscr_num',
    order = 'asc',
    offset = 0,
    count = 100,
    exclude_brc20 = false,
    signal,
  }: BestInSlotInscriptionByAddressArgs) {
    const queryParams = new URLSearchParams({
      address,
      sort_by: sortBy,
      order,
      exclude_brc20: exclude_brc20.toString(),
      offset: offset.toString(),
      count: count.toString(),
    });

    return withOrdinalsFallback(
      async () => {
        const resp = await axios.get<BestInSlotInscriptionByAddressResponse>(
          `${basePath}/wallet/inscriptions?${queryParams}`,
          { signal }
        );

        return inscriptionsByAddressSchema.parse(resp.data);
      },
      { block_height: 0, data: [] }
    );
  }

  async function getInscriptionsByAddresses({
    addresses,
    sortBy = 'inscr_num',
    order = 'asc',
    offset = 0,
    count = 100,
    exclude_brc20 = false,
    signal,
  }: BestInSlotInscriptionByAddressesArgs) {
    const data = {
      addresses,
      sort_by: sortBy,
      order,
      exclude_brc20,
      offset,
      count,
    };

    return withOrdinalsFallback(
      async () => {
        const resp = await axios.post<BestInSlotInscriptionByAddressResponse>(
          `${basePath}/wallet/inscriptions_batch`,
          data,
          { signal }
        );
        return inscriptionsByAddressSchema.parse(resp.data);
      },
      { block_height: 0, data: [] }
    );
  }

  async function getInscriptionsByTransactionId(id: string) {
    return withOrdinalsFallback(
      async () => {
        const resp = await axios.get<BestInSlotInscriptionsByTxIdResponse>(
          `${basePath}/inscription/in_transaction?tx_id=${id}`
        );

        return resp.data;
      },
      { data: [], blockHeight: 0 }
    );
  }

  /**
   * @see https://docs.bestinslot.xyz/reference/api-reference/ordinals-and-brc-20-and-runes-and-bitmap-v3-api-mainnet+testnet+signet/inscriptions#get-batch-inscription-information
   */
  async function getBatchInscriptionInfo(queries: string[]) {
    return withOrdinalsFallback(
      async () => {
        const resp = await axios.post<BestInSlotInscriptionsBatchInfoResponse>(
          `${basePath}/inscription/batch_info`,
          { queries }
        );
        return resp.data;
      },
      { data: [] }
    );
  }

  async function getInscriptionById(id: string) {
    return withOrdinalsFallback(
      async () => {
        const resp = await axios.get<BestInSlotInscriptionByIdResponse>(
          `${basePath}/inscription/single_info_id?inscription_id=${id}`
        );
        return resp.data;
      },
      { data: emptyBestInSlotInscription, block_height: 0 }
    );
  }

  async function getInscriptionsByXpub(xpub: string) {
    const params = new URLSearchParams();
    params.append('sort_by', 'inscr_num');
    params.append('order', 'desc');
    params.append('exclude_brc20', 'false');
    params.append('xpub', xpub);
    params.append('offset', '0');
    params.append('count', '2000');

    return withOrdinalsFallback(
      async () => {
        const resp = await axios.get<BestInSlotInscriptionByXpubResponse>(
          `${basePath}/wallet/inscriptions_xpub`,
          { params }
        );
        return resp.data;
      },
      { data: [], block_height: 0 }
    );
  }

  return {
    getInscriptionsByAddress,
    getInscriptionsByAddresses,
    getInscriptionsByTransactionId,
    getInscriptionsByXpub,
    getInscriptionById,
    getBatchInscriptionInfo,
  };
}
