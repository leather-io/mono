import axios from 'axios';

import { MEMPOOL_BASE_URL } from '@leather.io/constants';
import { BitcoinTx } from '@leather.io/models';

import { UtxoResponseItem } from '../../types/utxo';
import { getBitcoinRatelimiter } from '../bitcoin-rate-limiter';
import { BestInSlotApi } from './best-in-slot';

function AddressApi(basePath: string) {
  const rateLimiter = getBitcoinRatelimiter(basePath);
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
    async getFeeEstimatesFromMempoolSpaceApi(
      network: 'main' | 'test3' | 'test4'
    ): Promise<FeeResult> {
      const networkApi = {
        main: `${MEMPOOL_BASE_URL}/api/v1/fees/recommended`,
        test3: `${MEMPOOL_BASE_URL}/testnet/api/v1/fees/recommended`,
        test4: `${MEMPOOL_BASE_URL}/testnet4/api/v1/fees/recommended`,
        signet: `${MEMPOOL_BASE_URL}/signet/api/v1/fees/recommended`,
      }[network];
      const resp = await axios.get<FeeEstimateMempoolSpaceApiResponse>(networkApi);
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
      // TODO: refactor to use `axios` instead of `fetch`
      // https://github.com/leather-io/extension/issues/4521
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
  networkName: string;
  addressApi: ReturnType<typeof AddressApi>;
  feeEstimatesApi: ReturnType<typeof FeeEstimatesApi>;
  transactionsApi: ReturnType<typeof TransactionsApi>;
  BestInSlotApi: ReturnType<typeof BestInSlotApi>;
}

interface BestInSlotApiOptions {
  isOrdinalsActive?: boolean;
}

interface BitcoinClientArgs {
  networkName: string;
  basePath: string;
  bestInSlotPath: string;
  bestInSlotOptions?: BestInSlotApiOptions;
}

export function bitcoinClient({
  networkName,
  basePath,
  bestInSlotPath,
  bestInSlotOptions,
}: BitcoinClientArgs): BitcoinClient {
  return {
    networkName,
    addressApi: AddressApi(basePath),
    feeEstimatesApi: FeeEstimatesApi(),
    transactionsApi: TransactionsApi(basePath),
    BestInSlotApi: BestInSlotApi(bestInSlotPath, bestInSlotOptions),
  };
}
