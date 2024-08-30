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

interface BestInSlotInscriptionByAddressResponse {
  block_height: number;
  data: BestInSlotInscriptionsByTxIdResponse[];
}

export function BestInSlotApi(basePath: string) {
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

    const resp = await axios.get<BestInSlotInscriptionByAddressResponse>(
      `${basePath}/wallet/inscriptions?${queryParams}`,
      { signal }
    );

    return inscriptionsByAddressSchema.parse(resp.data);
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

    const resp = await axios.post<BestInSlotInscriptionByAddressResponse>(
      `${basePath}/wallet/inscriptions_batch`,
      data,
      { signal }
    );
    return inscriptionsByAddressSchema.parse(resp.data);
  }

  async function getInscriptionsByTransactionId(id: string) {
    const resp = await axios.get<BestInSlotInscriptionsByTxIdResponse>(
      `${basePath}/inscription/in_transaction?tx_id=${id}`
    );

    return resp.data;
  }

  /**
   * @see https://docs.bestinslot.xyz/reference/api-reference/ordinals-and-brc-20-and-runes-and-bitmap-v3-api-mainnet+testnet+signet/inscriptions#get-batch-inscription-information
   * @param queries can be a list of inscription id, inscription number or location (txid:index), however all types must be the same.
   *
   */
  async function getBatchInscriptionInfo(queries: string[]) {
    const resp = await axios.post<BestInSlotInscriptionsBatchInfoResponse>(
      `${basePath}/inscription/batch_info`,
      { queries }
    );
    return resp.data;
  }

  async function getInscriptionById(id: string) {
    const resp = await axios.get<BestInSlotInscriptionByIdResponse>(
      `${basePath}/inscription/single_info_id?inscription_id=${id}`
    );
    return resp.data;
  }

  /* BRC-20 */
  async function getBrc20Balances(address: string) {
    const resp = await axios.get<Brc20WalletBalancesResponse>(
      `${basePath}/brc20/wallet_balances?address=${address}`
    );
    return resp.data;
  }

  async function getBrc20TickerInfo(ticker: string) {
    const resp = await axios.get<Brc20TickerInfoResponse>(
      `${basePath}/brc20/ticker_info?ticker=${ticker}`
    );
    return resp.data;
  }

  /* RUNES */
  async function getRunesWalletBalances(address: string) {
    const resp = await axios.get<RunesWalletBalancesResponse>(
      `${basePath}/runes/wallet_balances?address=${address}`
    );
    return resp.data.data;
  }

  async function getRunesTickerInfo(runeName: string) {
    const resp = await axios.get<RunesTickerInfoResponse>(
      `${basePath}/runes/ticker_info?rune_name=${runeName}`
    );
    return runeTickerInfoSchema.parse(resp.data.data);
  }

  async function getRunesBatchOutputsInfo(outputs: string[]) {
    const resp = await axios.post<RunesOutputsByAddressResponse>(
      `${basePath}/runes/batch_output_info`,
      { queries: outputs }
    );
    return resp.data.data;
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

    const resp = await axios.get<RunesOutputsByAddressResponse>(
      `${basePath}/runes/wallet_valid_outputs?${queryParams}`,
      { signal }
    );
    return resp.data.data;
  }

  return {
    getInscriptionsByAddress,
    getInscriptionsByAddresses,
    getInscriptionsByTransactionId,
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
