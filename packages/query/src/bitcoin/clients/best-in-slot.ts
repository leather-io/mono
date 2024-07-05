import axios from 'axios';
import { ZodError, z } from 'zod';

import {
  type BitcoinNetworkModes,
  MarketData,
  Money,
  WalletDefaultNetworkConfigurationIds,
} from '@leather.io/models';

import { BestinslotInscriptionResponse } from '../../../types/inscription';

export interface BestinSlotInscriptionByIdResponse {
  data: BestinslotInscriptionResponse;
  block_height: number;
}

export interface BestinSlotInscriptionsByTxIdResponse {
  data: { inscription_id: string }[];
  blockHeight: number;
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

export interface RuneTickerInfo {
  rune_id: string;
  rune_number: string;
  rune_name: string;
  spaced_rune_name: string;
  symbol: string;
  decimals: number;
  per_mint_amount: string;
  mint_cnt: string;
  mint_cnt_limit: string;
  premined_supply: string;
  total_minted_supply: string;
  burned_supply: string;
  circulating_supply: string;
  mint_progress: number;
  mint_start_block: number | null;
  mint_end_block: number | null;
  genesis_block: number;
  deploy_ts: string;
  deploy_txid: string;
  auto_upgrade: boolean;
  holder_count: number;
  event_count: number;
  mintable: boolean;
}
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

interface BestinSlotInscriptionByAddressResponse {
  block_height: number;
  data: BestinslotInscriptionResponse[];
}

const bestInSlotInscriptionDelegateSchema = z.object({
  delegate_id: z.string(),
  render_url: z.string().nullable().optional(),
  mime_type: z.string().nullable().optional(),
  content_url: z.string(),
  bis_url: z.string(),
});

const bestInSlotInscriptionSchema = z.object({
  inscription_name: z.string().nullable().optional(),
  inscription_id: z.string(),
  inscription_number: z.number(),
  parent_ids: z.array(z.string()),
  metadata: z.any().nullable(),
  owner_wallet_addr: z.string(),
  mime_type: z.string().nullable().optional(),
  last_sale_price: z.number().nullable().optional(),
  slug: z.string().nullable().optional(),
  collection_name: z.string().nullable().optional(),
  satpoint: z.string(),
  last_transfer_block_height: z.number().nullable().optional(),
  genesis_height: z.number(),
  content_url: z.string(),
  bis_url: z.string(),
  render_url: z.string().nullable().optional(),
  bitmap_number: z.number().nullable().optional(),
  delegate: bestInSlotInscriptionDelegateSchema.nullable().optional(),
});

const inscriptionsByAddressSchema = z.object({
  block_height: z.number(),
  data: z.array(bestInSlotInscriptionSchema),
});

export function BestinSlotApi(basePath: string) {
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

    const resp = await axios.get<BestinSlotInscriptionByAddressResponse>(
      `${basePath}/wallet/inscriptions?${queryParams}`,
      { signal }
    );

    try {
      return inscriptionsByAddressSchema.parse(resp.data);
    } catch (e) {
      // TODO: should be analytics
      // eslint-disable-next-line no-console
      if (e instanceof ZodError) console.log('schema_fail', e);
      throw e;
    }
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

    const resp = await axios.post<BestinSlotInscriptionByAddressResponse>(
      `${basePath}/wallet/inscriptions_batch`,
      data,
      { signal }
    );

    try {
      return inscriptionsByAddressSchema.parse(resp.data);
    } catch (e) {
      // TODO: should be analytics
      // eslint-disable-next-line no-console
      if (e instanceof ZodError) console.log('schema_fail', e);
      throw e;
    }
  }

  async function getInscriptionsByTransactionId(id: string) {
    const resp = await axios.get<BestinSlotInscriptionsByTxIdResponse>(
      `${basePath}/inscription/in_transaction?tx_id=${id}`
    );

    return resp.data;
  }

  async function getInscriptionById(id: string) {
    const resp = await axios.get<BestinSlotInscriptionByIdResponse>(
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
    return resp.data.data;
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
  };
}
