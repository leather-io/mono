import axios from 'axios';
import { z } from 'zod';

import {
  type BitcoinNetworkModes,
  MarketData,
  Money,
  WalletDefaultNetworkConfigurationIds,
} from '@leather.io/models';

import {
  bestInSlotInscriptionSchema,
  bestInslotInscriptionBatchInfoSchema,
  inscriptionsByAddressSchema,
  runeTickerInfoSchema,
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

/* BRC-20 */
export interface Brc20Balance {
  ticker: string;
  overall_balance: string;
  available_balance: string;
  transferrable_balance: string;
  image_url: string | null;
  min_listed_unit_price: number | null;
}

export interface Brc20TickerInfo {
  id: string;
  number: number;
  block_height: number;
  tx_id: string;
  address: string;
  ticker: string;
  max_supply: string;
  mint_limit: string;
  decimals: number;
  deploy_timestamp: number;
  minted_supply: string;
  tx_count: number;
}

interface Brc20TickerInfoResponse {
  block_height: number;
  data: Brc20TickerInfo;
}

interface Brc20WalletBalancesResponse {
  block_height: number;
  data: Brc20Balance[];
}

export interface Brc20Token {
  balance: Money | null;
  holderAddress: string;
  marketData: MarketData | null;
  tokenData: Brc20Balance & Brc20TickerInfo;
}

/* RUNES */
export interface RuneBalance {
  pkscript: string;
  rune_id: string;
  rune_name: string;
  spaced_rune_name: string;
  total_balance: string;
  wallet_addr: string;
}

interface RunesWalletBalancesResponse {
  block_height: number;
  data: RuneBalance[];
}

export type RuneTickerInfo = z.infer<typeof runeTickerInfoSchema>;

interface RunesTickerInfoResponse {
  block_height: number;
  data: RuneTickerInfo;
}

export interface RunesOutputsByAddress {
  pkscript: string;
  wallet_addr: string;
  output: string;
  rune_ids: string[];
  balances: number[];
  rune_names: string[];
  spaced_rune_names: string[];
  total_balances: string[];
  min_listed_unit_price_in_sats: string;
  min_listed_unit_price_unisat: string;
}

interface RunesOutputsByAddressArgs {
  address: string;
  network?: BitcoinNetworkModes;
  sortBy?: 'output';
  order?: 'asc' | 'desc';
  offset?: number;
  count?: number;
  signal?: AbortSignal;
}

interface RunesOutputsByAddressResponse {
  block_height: number;
  data: RunesOutputsByAddress[];
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

const emptyBrc20TickerInfo: Brc20TickerInfo = {
  id: '',
  number: 0,
  block_height: 0,
  tx_id: '',
  address: '',
  ticker: '',
  max_supply: '0',
  mint_limit: '0',
  decimals: 0,
  deploy_timestamp: 0,
  minted_supply: '0',
  tx_count: 0,
};

const emptyRuneTickerInfo: RuneTickerInfo = {
  rune_id: '',
  rune_number: '',
  rune_name: '',
  spaced_rune_name: '',
  symbol: '',
  decimals: 0,
  per_mint_amount: '0',
  mint_cnt: '0',
  mint_cnt_limit: '0',
  premined_supply: '0',
  total_minted_supply: '0',
  burned_supply: '0',
  circulating_supply: '0',
  mint_progress: 0,
  mint_start_block: null,
  mint_end_block: null,
  genesis_block: 0,
  deploy_ts: '',
  deploy_txid: '',
  auto_upgrade: false,
  holder_count: 0,
  event_count: 0,
  mintable: false,
  icon_inscr_id: null,
  icon_delegate_id: null,
  icon_content_url: null,
  icon_render_url: null,
  avg_unit_price_in_sats: null,
  min_listed_unit_price_in_sats: null,
  min_listed_unit_price_unisat: null,
  listed_supply: '0',
  listed_supply_ratio: 0,
  marketcap: null,
  total_sale_info: {
    sale_count: 0,
    sale_amount: '0',
    vol_3h: 0,
    vol_6h: 0,
    vol_9h: 0,
    vol_12h: 0,
    vol_1d: 0,
    vol_3d: 0,
    vol_7d: 0,
    vol_30d: 0,
    vol_total: 0,
  },
};

export function BestInSlotApi(basePath: string) {
  async function withFallback<T>(request: () => Promise<T>, fallbackValue: T): Promise<T> {
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
    // 2000 is the maximum count
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

    return withFallback(
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
    // 2000 is the maximum count
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

    return withFallback(
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
    return withFallback(
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
   * @param queries can be a list of inscription id, inscription number or location (txid:index), however all types must be the same.
   *
   */
  async function getBatchInscriptionInfo(queries: string[]) {
    return withFallback(
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
    return withFallback(
      async () => {
        const resp = await axios.get<BestInSlotInscriptionByIdResponse>(
          `${basePath}/inscription/single_info_id?inscription_id=${id}`
        );
        return resp.data;
      },
      { data: emptyBestInSlotInscription, block_height: 0 }
    );
  }

  /* BRC-20 */
  async function getBrc20Balances(address: string) {
    return withFallback(
      async () => {
        const resp = await axios.get<Brc20WalletBalancesResponse>(
          `${basePath}/brc20/wallet_balances?address=${address}`
        );
        return resp.data;
      },
      { block_height: 0, data: [] }
    );
  }

  async function getBrc20TickerInfo(ticker: string) {
    return withFallback(
      async () => {
        const resp = await axios.get<Brc20TickerInfoResponse>(
          `${basePath}/brc20/ticker_info?ticker=${ticker}`
        );
        return resp.data;
      },
      { block_height: 0, data: emptyBrc20TickerInfo }
    );
  }

  /* RUNES */
  async function getRunesWalletBalances(address: string) {
    return withFallback(async () => {
      const resp = await axios.get<RunesWalletBalancesResponse>(
        `${basePath}/runes/wallet_balances?address=${address}`
      );
      return resp.data.data;
    }, []);
  }

  async function getRunesTickerInfo(runeName: string) {
    return withFallback(async () => {
      const resp = await axios.get<RunesTickerInfoResponse>(
        `${basePath}/runes/ticker_info?rune_name=${runeName}`
      );
      return runeTickerInfoSchema.parse(resp.data.data);
    }, emptyRuneTickerInfo);
  }

  async function getRunesBatchOutputsInfo(outputs: string[]) {
    return withFallback(async () => {
      const resp = await axios.post<RunesOutputsByAddressResponse>(
        `${basePath}/runes/batch_output_info`,
        { queries: outputs }
      );
      return resp.data.data;
    }, []);
  }

  /**
   * @see https://docs.bestinslot.xyz/reference/api-reference/ordinals-and-brc-20-and-runes-and-bitmap-v3-api-mainnet+testnet/runes#runes-wallet-valid-outputs
   */
  async function getRunesOutputsByAddress({
    address,
    sortBy = 'output',
    order = 'asc',
    offset = 0,
    count = 100,
    signal,
  }: RunesOutputsByAddressArgs) {
    const queryParams = new URLSearchParams({
      address,
      sort_by: sortBy,
      order,
      offset: offset.toString(),
      count: count.toString(),
    });

    return withFallback(async () => {
      const resp = await axios.get<RunesOutputsByAddressResponse>(
        `${basePath}/runes/wallet_valid_outputs?${queryParams}`,
        { signal }
      );
      return resp.data.data;
    }, []);
  }

  // https://leatherapi.bestinslot.xyz/v3/wallet/inscriptions_xpub?sort_by=inscr_num&order=desc&offset=0&count=100&exclude_brc20=true&xpub=tr(xpub6CXPXMfXcvsrKobgiqZJm1XdW4HBEB7dM1FfpZmbWjmU5yMp6npza7MD6Jd3xUJZCX9wy6cTiT1xTh7aE3aXDSzVRHFQVwG8SoKnwkW7QD2)

  async function getInscriptionsByXpub(xpub: string) {
    const params = new URLSearchParams();
    params.append('sort_by', 'inscr_num');
    params.append('order', 'desc');
    params.append('exclude_brc20', 'false');
    params.append('xpub', xpub);
    // TODO: Verify with BIS if results actually are paginated
    params.append('offset', '0');
    params.append('count', '2000');

    return withFallback(
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
    getBrc20Balances,
    getBrc20TickerInfo,
    getRunesWalletBalances,
    getRunesTickerInfo,
    getRunesBatchOutputsInfo,
    getRunesOutputsByAddress,
    getBatchInscriptionInfo,
  };
}
