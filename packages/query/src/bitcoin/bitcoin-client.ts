import axios from 'axios';

import {
  BESTINSLOT_API_BASE_URL_MAINNET,
  BESTINSLOT_API_BASE_URL_TESTNET,
  type BitcoinNetworkModes,
  type BitcoinTx,
  MarketData,
  Money,
} from '@leather-wallet/models';

import { UtxoResponseItem } from '../../types/utxo';
import { useLeatherNetwork } from '../leather-query-provider';
import { getBlockstreamRatelimiter } from './blockstream-rate-limiter';

interface BestinslotInscription {
  inscription_name: string | null;
  inscription_id: string;
  inscription_number: number;
  metadata: any | null;
  wallet: string;
  mime_type: string;
  media_length: number;
  genesis_ts: number;
  genesis_height: number;
  genesis_fee: number;
  output_value: number;
  satpoint: string;
  collection_name: string | null;
  collection_slug: string | null;
  last_transfer_block_height: number;
  content_url: string;
  bis_url: string;
  byte_size: number;
}

export interface BestinSlotInscriptionByIdResponse {
  data: BestinslotInscription;
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

function BestinSlotApi() {
  const url = BESTINSLOT_API_BASE_URL_MAINNET;
  const testnetUrl = BESTINSLOT_API_BASE_URL_TESTNET;

  const defaultOptions = {
    headers: {
      'x-api-key': `${process.env.BESTINSLOT_API_KEY}`,
    },
  };

  async function getInscriptionsByTransactionId(id: string) {
    const resp = await axios.get<BestinSlotInscriptionsByTxIdResponse>(
      `${url}/inscription/in_transaction?tx_id=${id}`,
      {
        ...defaultOptions,
      }
    );

    return resp.data;
  }

  async function getInscriptionById(id: string) {
    const resp = await axios.get<BestinSlotInscriptionByIdResponse>(
      `${url}/inscription/single_info_id?inscription_id=${id}`,
      {
        ...defaultOptions,
      }
    );
    return resp.data;
  }

  /* BRC-20 */
  async function getBrc20Balances(address: string) {
    const resp = await axios.get<Brc20WalletBalancesResponse>(
      `${url}/brc20/wallet_balances?address=${address}`,
      {
        ...defaultOptions,
      }
    );
    return resp.data;
  }

  async function getBrc20TickerInfo(ticker: string) {
    const resp = await axios.get<Brc20TickerInfoResponse>(
      `${url}/brc20/ticker_info?ticker=${ticker}`,
      {
        ...defaultOptions,
      }
    );
    return resp.data;
  }

  /* RUNES */
  async function getRunesWalletBalances(address: string, network: BitcoinNetworkModes) {
    const baseUrl = network === 'mainnet' ? url : testnetUrl;
    const resp = await axios.get<RunesWalletBalancesResponse>(
      `${baseUrl}/runes/wallet_balances?address=${address}`,
      { ...defaultOptions }
    );
    return resp.data.data;
  }

  async function getRunesTickerInfo(runeName: string, network: BitcoinNetworkModes) {
    const baseUrl = network === 'mainnet' ? url : testnetUrl;
    const resp = await axios.get<RunesTickerInfoResponse>(
      `${baseUrl}/runes/ticker_info?rune_name=${runeName}`,
      { ...defaultOptions }
    );
    return resp.data.data;
  }

  async function getRunesBatchOutputsInfo(outputs: string[], network: BitcoinNetworkModes) {
    const baseUrl = network === 'mainnet' ? url : testnetUrl;

    const resp = await axios.post<RunesOutputsByAddressResponse>(
      `${baseUrl}/runes/batch_output_info`,
      { queries: outputs },
      { ...defaultOptions }
    );
    return resp.data.data;
  }

  /**
   * @see https://docs.bestinslot.xyz/reference/api-reference/ordinals-and-brc-20-and-runes-and-bitmap-v3-api-mainnet+testnet/runes#runes-wallet-valid-outputs
   */
  async function getRunesOutputsByAddress({
    address,
    network = 'mainnet',
    sortBy = 'output',
    order = 'asc',
    offset = 0,
    count = 100,
    signal,
  }: RunesOutputsByAddressArgs) {
    const baseUrl = network === 'mainnet' ? url : testnetUrl;
    const queryParams = new URLSearchParams({
      address,
      sort_by: sortBy,
      order,
      offset: offset.toString(),
      count: count.toString(),
    });

    const resp = await axios.get<RunesOutputsByAddressResponse>(
      `${baseUrl}/runes/wallet_valid_outputs?${queryParams}`,
      { ...defaultOptions, signal }
    );
    return resp.data.data;
  }

  return {
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

function AddressApi(basePath: string) {
  const rateLimiter = getBlockstreamRatelimiter(basePath);
  return {
    async getTransactionsByAddress(address: string, signal?: AbortSignal) {
      const resp = await rateLimiter.add(
        () => axios.get<BitcoinTx[]>(`${basePath}/address/${address}/txs`, { signal }),
        { signal, throwOnTimeout: true }
      );
      return resp.data;
    },
    async getUtxosByAddress(address: string, signal?: AbortSignal): Promise<UtxoResponseItem[]> {
      const resp = await rateLimiter.add(
        () => axios.get<UtxoResponseItem[]>(`${basePath}/address/${address}/utxo`, { signal }),
        { signal, priority: 1, throwOnTimeout: true }
      );
      return resp.data.sort((a, b) => a.vout - b.vout);
    },
  };
}

interface FeeEstimateEarnApiResponse {
  name: string;
  height: number;
  hash: string;
  time: string;
  latest_url: string;
  previous_hash: string;
  previous_url: string;
  peer_count: number;
  unconfirmed_count: number;
  high_fee_per_kb: number;
  medium_fee_per_kb: number;
  low_fee_per_kb: number;
  last_fork_height: number;
  last_fork_hash: string;
}
interface FeeEstimateMempoolSpaceApiResponse {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}

export interface FeeResult {
  fast: number;
  medium: number;
  slow: number;
}

function FeeEstimatesApi() {
  return {
    async getFeeEstimatesFromBlockcypherApi(network: 'main' | 'test3'): Promise<FeeResult> {
      // https://www.blockcypher.com/dev/bitcoin/#restful-resources
      const resp = await axios.get<FeeEstimateEarnApiResponse>(
        `https://api.blockcypher.com/v1/btc/${network}`
      );
      const { low_fee_per_kb, medium_fee_per_kb, high_fee_per_kb } = resp.data;
      // These fees are in satoshis per kb
      return {
        slow: low_fee_per_kb / 1000,
        medium: medium_fee_per_kb / 1000,
        fast: high_fee_per_kb / 1000,
      };
    },
    async getFeeEstimatesFromMempoolSpaceApi(): Promise<FeeResult> {
      const resp = await axios.get<FeeEstimateMempoolSpaceApiResponse>(
        `https://mempool.space/api/v1/fees/recommended`
      );
      const { fastestFee, halfHourFee, hourFee } = resp.data;
      return {
        slow: hourFee,
        medium: halfHourFee,
        fast: fastestFee,
      };
    },
  };
}

function TransactionsApi(basePath: string) {
  return {
    async getBitcoinTransaction(txid: string) {
      const resp = await axios.get(`${basePath}/tx/${txid}`);
      return resp.data;
    },

    async getBitcoinTransactionHex(txid: string) {
      const resp = await axios.get(`${basePath}/tx/${txid}/hex`, {
        responseType: 'text',
      });
      return resp.data;
    },

    async broadcastTransaction(tx: string) {
      // TODO: refactor to use `axios`
      // https://github.com/leather-io/extension/issues/4521
      // eslint-disable-next-line no-restricted-globals
      return fetch(`${basePath}/tx`, {
        method: 'POST',
        body: tx,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    },
  };
}

export interface BitcoinClient {
  addressApi: ReturnType<typeof AddressApi>;
  feeEstimatesApi: ReturnType<typeof FeeEstimatesApi>;
  transactionsApi: ReturnType<typeof TransactionsApi>;
  BestinSlotApi: ReturnType<typeof BestinSlotApi>;
}

export function bitcoinClient(basePath: string): BitcoinClient {
  return {
    addressApi: AddressApi(basePath),
    feeEstimatesApi: FeeEstimatesApi(),
    transactionsApi: TransactionsApi(basePath),
    BestinSlotApi: BestinSlotApi(),
  };
}

export function useBitcoinClient() {
  const network = useLeatherNetwork();

  return bitcoinClient(network.chain.bitcoin.bitcoinUrl);
}
