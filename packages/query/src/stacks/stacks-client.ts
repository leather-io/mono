import { FtMetadataResponse, NftMetadataResponse } from '@hirosystems/token-metadata-api-client';
import type {
  AddressNonces,
  AddressTransactionsWithTransfersListResponse,
  BnsGetNameInfoResponse,
  BnsNamesOwnByAddressResponse,
  GetRawTransactionResult,
  MempoolTransaction,
  MempoolTransactionListResponse,
  NetworkBlockTimesResponse,
  ReadOnlyFunctionArgs,
  ReadOnlyFunctionSuccessResponse,
  Transaction,
} from '@stacks/stacks-blockchain-api-types';
import axios from 'axios';

import { DEFAULT_LIST_LIMIT } from '@leather.io/constants';
import { STX20_API_BASE_URL_MAINNET } from '@leather.io/models';

import { Paginated } from '../../types/api-types';
import { useLeatherNetwork } from '../leather-query-provider';
import { getHiroApiRateLimiter } from '../rate-limiter/hiro-rate-limiter';
import type {
  AddressBalanceResponse,
  ContractInterfaceResponseWithFunctions,
  NonFungibleTokenHoldingListResult,
  StacksTxFeeEstimation,
} from './hiro-api-types';
import { hiroApiRequestsPriorityLevels } from './hiro-requests-priorities';
import './leather-headers';
import type { Stx20BalanceResponse } from './stx20-api-types';

type NonFungibleTokenHoldingsResponse = Paginated<NonFungibleTokenHoldingListResult[]>;

export interface CallReadOnlyFunctionArgs {
  contractAddress: string;
  contractName: string;
  functionName: string;
  readOnlyFunctionArgs: ReadOnlyFunctionArgs;
  tip?: string;
  signal?: AbortSignal;
}

export function stacksClient(basePath: string) {
  const rateLimiter = getHiroApiRateLimiter(basePath);

  return {
    async getAccountBalance(address: string, signal: AbortSignal) {
      const resp = await rateLimiter.add(
        () =>
          axios.get<AddressBalanceResponse>(`${basePath}/extended/v1/address/${address}/balances`, {
            signal,
          }),
        {
          priority: hiroApiRequestsPriorityLevels.getAccountBalance,
          signal,
          throwOnTimeout: true,
        }
      );
      return resp.data;
    },
    async getAccountNonces(address: string, signal: AbortSignal) {
      const resp = await rateLimiter.add(
        () =>
          axios.get<AddressNonces>(`${basePath}/extended/v1/address/${address}/nonces`, { signal }),
        {
          priority: hiroApiRequestsPriorityLevels.getAccountNonces,
          signal,
          throwOnTimeout: true,
        }
      );
      return resp.data;
    },
    // TODO: Need to replace, this endpoint has been deprecated
    async getAccountTransactionsWithTransfers(address: string, signal: AbortSignal) {
      const resp = await rateLimiter.add(
        () =>
          axios.get<AddressTransactionsWithTransfersListResponse>(
            `${basePath}/extended/v1/address/${address}/transactions_with_transfers?limit=${DEFAULT_LIST_LIMIT}`,
            { signal }
          ),
        {
          priority: hiroApiRequestsPriorityLevels.getAccountTransactionsWithTransfers,
          signal,
          throwOnTimeout: true,
        }
      );
      return resp.data;
    },
    async postFeeTransaction(estimatedLen: number | null, transactionPayload: string) {
      const resp = await rateLimiter.add(
        () =>
          axios.post<StacksTxFeeEstimation>(`${basePath}/v2/fees/transaction`, {
            estimated_len: estimatedLen,
            transaction_payload: transactionPayload,
          }),
        { priority: hiroApiRequestsPriorityLevels.postFeeTransaction, throwOnTimeout: true }
      );
      return resp.data;
    },
    async getNetworkBlockTimes() {
      const resp = await rateLimiter.add(
        () =>
          axios.get<NetworkBlockTimesResponse>(`${basePath}/extended/v1/info/network_block_times`),
        { priority: hiroApiRequestsPriorityLevels.getNetworkBlockTimes, throwOnTimeout: true }
      );
      return resp.data;
    },
    async getNamesOwnedByAddress(address: string, signal: AbortSignal) {
      const resp = await rateLimiter.add(
        () =>
          axios.get<BnsNamesOwnByAddressResponse>(`${basePath}/v1/addresses/stacks/${address}`, {
            signal,
          }),
        {
          priority: hiroApiRequestsPriorityLevels.getNamesOwnedByAddress,
          signal,
          throwOnTimeout: true,
        }
      );
      return resp.data;
    },
    async getNameInfo(name: string, signal?: AbortSignal) {
      const resp = await rateLimiter.add(
        () =>
          axios.get<BnsGetNameInfoResponse>(`${basePath}/v1/names/${name}`, {
            signal,
          }),
        { priority: hiroApiRequestsPriorityLevels.getNameInfo, signal, throwOnTimeout: true }
      );
      return resp.data;
    },
    async getNetworkStatus(url: string) {
      const resp = await rateLimiter.add(() => axios.get(url, { timeout: 30000 }), {
        priority: hiroApiRequestsPriorityLevels.getNetworkStatus,
        throwOnTimeout: true,
      });
      return resp.data;
    },
    async getNftHoldings(address: string, signal: AbortSignal) {
      const resp = await rateLimiter.add(
        () =>
          axios.get<NonFungibleTokenHoldingsResponse>(
            `${basePath}/extended/v1/tokens/nft/holdings?principal=${address}&limit=${DEFAULT_LIST_LIMIT}`,
            { signal }
          ),
        {
          priority: hiroApiRequestsPriorityLevels.getNftHoldings,
          signal,
          throwOnTimeout: true,
        }
      );
      return resp.data;
    },
    async getAddressMempoolTransactions(address: string, signal: AbortSignal) {
      const resp = await rateLimiter.add(
        () =>
          axios.get<MempoolTransactionListResponse>(
            `${basePath}/extended/v1/tx/mempool?address=${address}&limit=${DEFAULT_LIST_LIMIT}`,
            { signal }
          ),
        {
          priority: hiroApiRequestsPriorityLevels.getAddressMempoolTransactions,
          signal,
          throwOnTimeout: true,
        }
      );
      return resp.data;
    },
    async getRawTransactionById(txid: string, signal: AbortSignal) {
      const resp = await rateLimiter.add(
        () =>
          axios.get<GetRawTransactionResult>(`${basePath}/extended/v1/tx/${txid}/raw`, { signal }),
        {
          priority: hiroApiRequestsPriorityLevels.getRawTransactionById,
          signal,
          throwOnTimeout: true,
        }
      );
      return resp.data;
    },
    async getTransactionById(txid: string, signal: AbortSignal) {
      const resp = await rateLimiter.add(
        () =>
          axios.get<MempoolTransaction | Transaction>(`${basePath}/extended/v1/tx/${txid}`, {
            signal,
          }),
        {
          priority: hiroApiRequestsPriorityLevels.getTransactionById,
          signal,
          throwOnTimeout: true,
        }
      );
      return resp.data;
    },
    async getFtMetadata(address: string, signal: AbortSignal) {
      const resp = await rateLimiter.add(
        () => axios.get<FtMetadataResponse>(`${basePath}/metadata/v1/ft/${address}`, { signal }),
        { priority: hiroApiRequestsPriorityLevels.getFtMetadata, signal, throwOnTimeout: true }
      );
      return resp.data;
    },
    async getNftMetadata(address: string, tokenId: number, signal: AbortSignal) {
      const resp = await rateLimiter.add(
        () =>
          axios.get<NftMetadataResponse>(`${basePath}/metadata/v1/nft/${address}/${tokenId}`, {
            signal,
          }),
        {
          priority: hiroApiRequestsPriorityLevels.getNftMetadata,
          signal,
          throwOnTimeout: true,
        }
      );
      return resp.data;
    },
    async callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName,
      readOnlyFunctionArgs,
      tip,
      signal,
    }: CallReadOnlyFunctionArgs) {
      const resp = await rateLimiter.add(
        () =>
          axios.post<ReadOnlyFunctionSuccessResponse>(
            `${basePath}/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}?tip=${tip}`,
            {
              ...readOnlyFunctionArgs,
              signal,
            }
          ),
        {
          priority: hiroApiRequestsPriorityLevels.callReadOnlyFunction,
          signal,
          throwOnTimeout: true,
        }
      );
      return resp.data;
    },
    async getContractInterface(
      contractAddress: string,
      contractName: string,
      signal?: AbortSignal
    ) {
      const resp = await rateLimiter.add(
        () =>
          axios.get<ContractInterfaceResponseWithFunctions>(
            `${basePath}/v2/contracts/interface/${contractAddress}/${contractName}`,
            { signal }
          ),
        {
          priority: hiroApiRequestsPriorityLevels.getContractInterface,
          signal,
          throwOnTimeout: true,
        }
      );
      return resp.data;
    },
    async getStx20Balances(address: string, signal: AbortSignal) {
      const resp = await rateLimiter.add(
        () =>
          axios.get<Stx20BalanceResponse>(`${STX20_API_BASE_URL_MAINNET}/balance/${address}`, {
            signal,
          }),
        {
          priority: hiroApiRequestsPriorityLevels.getStx20Balances,
          signal,
          throwOnTimeout: true,
        }
      );
      return resp.data.balances;
    },
  };
}

export type StacksClient = ReturnType<typeof stacksClient>;

export function useStacksClient() {
  const network = useLeatherNetwork();
  return stacksClient(network.chain.stacks.url);
}
