import { HIRO_API_BASE_URL_MAINNET } from '@leather-wallet/constants';
import axios from 'axios';

import type { Paginated } from '../../types/api-types';
import { UtxoResponseItem } from '../../types/utxo';
import { useLeatherNetwork } from '../leather-query-provider';

class Configuration {
  constructor(public baseUrl: string) {}
}

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

export interface BestinslotInscriptionByIdResponse {
  data: BestinslotInscription;
  block_height: number;
}

export interface BestinslotInscriptionsByTxIdResponse {
  data: { inscription_id: string }[];
  blockHeight: number;
}

interface Brc20TokenResponse {
  ticker: string;
  overall_balance: string;
  available_balance: string;
  transferrable_balance: string;
  image_url: string | null;
}

export interface Brc20Token extends Brc20TokenResponse {
  decimals: number;
  holderAddress: string;
}

interface Brc20TokenTicker {
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

interface Brc20TickerResponse {
  data: Brc20TokenTicker;
  block_height: number;
}

interface BestinslotBrc20AddressBalanceResponse {
  block_height: number;
  data: Brc20TokenResponse[];
}

class BestinslotApi {
  url = 'https://api.bestinslot.xyz/v3';
  private defaultOptions = {
    headers: {
      'x-api-key': `${process.env.BESTINSLOT_API_KEY}`,
    },
  };
  constructor(public configuration: Configuration) {}

  async getInscriptionsByTransactionId(id: string) {
    const resp = await axios.get<BestinslotInscriptionsByTxIdResponse>(
      `${this.url}/inscription/in_transaction?tx_id=${id}`,
      {
        ...this.defaultOptions,
      }
    );

    return resp.data;
  }

  async getInscriptionById(id: string) {
    const resp = await axios.get<BestinslotInscriptionByIdResponse>(
      `${this.url}/inscription/single_info_id?inscription_id=${id}`,
      {
        ...this.defaultOptions,
      }
    );
    return resp.data;
  }

  async getBrc20Balance(address: string) {
    const resp = await axios.get<BestinslotBrc20AddressBalanceResponse>(
      `${this.url}/brc20/wallet_balances?address=${address}`,
      {
        ...this.defaultOptions,
      }
    );
    return resp.data;
  }

  async getBrc20TickerData(ticker: string) {
    const resp = await axios.get<Brc20TickerResponse>(
      `${this.url}/brc20/ticker_info?ticker=${ticker}`,
      {
        ...this.defaultOptions,
      }
    );
    return resp.data;
  }
}

class HiroApi {
  url = HIRO_API_BASE_URL_MAINNET;

  async getBrc20Balance(address: string) {
    const resp = await axios.get<Paginated<Brc20TokenResponse[]>>(
      `${this.url}/ordinals/v1/brc-20/balances/${address}`
    );
    return resp.data;
  }

  async getBrc20TickerData(ticker: string) {
    const resp = await axios.get<Paginated<Brc20TokenTicker[]>>(
      `${this.url}/ordinals/v1/brc-20/tokens?ticker=${ticker}`
    );
    return resp.data;
  }
}

class AddressApi {
  constructor(public configuration: Configuration) {}

  async getTransactionsByAddress(address: string) {
    const resp = await axios.get(`${this.configuration.baseUrl}/address/${address}/txs`);
    return resp.data;
  }

  async getUtxosByAddress(address: string): Promise<UtxoResponseItem[]> {
    const resp = await axios.get<UtxoResponseItem[]>(
      `${this.configuration.baseUrl}/address/${address}/utxo`
    );
    return resp.data.sort((a, b) => a.vout - b.vout);
  }
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

class FeeEstimatesApi {
  constructor(public configuration: Configuration) {}

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
  }

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
  }
}

class TransactionsApi {
  constructor(public configuration: Configuration) {}

  async getBitcoinTransaction(txid: string) {
    const resp = await axios.get(`${this.configuration.baseUrl}/tx/${txid}`);
    return resp.data;
  }

  async getBitcoinTransactionHex(txid: string) {
    const resp = await axios.get(`${this.configuration.baseUrl}/tx/${txid}/hex`, {
      responseType: 'text',
    });
    return resp.data;
  }

  async broadcastTransaction(tx: string) {
    // TODO: refactor to use `axios`
    // https://github.com/leather-wallet/extension/issues/4521
    // eslint-disable-next-line no-restricted-globals
    return fetch(`${this.configuration.baseUrl}/tx`, {
      method: 'POST',
      body: tx,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }
}

export class BitcoinClient {
  configuration: Configuration;
  addressApi: AddressApi;
  feeEstimatesApi: FeeEstimatesApi;
  transactionsApi: TransactionsApi;
  BestinslotApi: BestinslotApi;
  HiroApi: HiroApi;

  constructor(basePath: string) {
    this.configuration = new Configuration(basePath);
    this.addressApi = new AddressApi(this.configuration);
    this.feeEstimatesApi = new FeeEstimatesApi(this.configuration);
    this.transactionsApi = new TransactionsApi(this.configuration);
    this.BestinslotApi = new BestinslotApi(this.configuration);
    this.HiroApi = new HiroApi();
  }
}

export function useBitcoinClient() {
  const network = useLeatherNetwork();

  return new BitcoinClient(network.chain.bitcoin.bitcoinUrl);
}
