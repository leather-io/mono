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
        { signal, throwOnTimeout: true }
      );
      return resp.data;
    },
    async getAccountNonces(address: string, signal: AbortSignal) {
      const resp = await rateLimiter.add(
        () =>
          axios.get<AddressNonces>(`${basePath}/extended/v1/address/${address}/nonces`, { signal }),
        { signal, throwOnTimeout: true }
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
        { signal, throwOnTimeout: true }
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
        {
          priority: 2,
          throwOnTimeout: true,
        }
      );
      return resp.data;
    },
    async getNetworkBlockTimes() {
      const resp = await rateLimiter.add(
        () =>
          axios.get<NetworkBlockTimesResponse>(`${basePath}/extended/v1/info/network_block_times`),
        { throwOnTimeout: true }
      );
      return resp.data;
    },
    async getNamesOwnedByAddress(address: string, signal: AbortSignal) {
      const resp = await rateLimiter.add(
        () =>
          axios.get<BnsNamesOwnByAddressResponse>(`${basePath}/v1/addresses/stacks/${address}`, {
            signal,
          }),
        { signal, priority: 2, throwOnTimeout: true }
      );
      return resp.data;
    },
    async getNameInfo(name: string, signal?: AbortSignal) {
      const resp = await rateLimiter.add(
        () =>
          axios.get<BnsGetNameInfoResponse>(`${basePath}/v1/names/${name}`, {
            signal,
          }),
        { signal, throwOnTimeout: true }
      );
      return resp.data;
    },
    async getNetworkStatus(url: string) {
      const resp = await rateLimiter.add(() => axios.get(url, { timeout: 30000 }), {
        throwOnTimeout: true,
        priority: 3,
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
        { signal, throwOnTimeout: true }
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
        { signal, throwOnTimeout: true }
      );
      return resp.data;
    },
    async getRawTransactionById(txid: string, signal: AbortSignal) {
      const resp = await rateLimiter.add(
        () =>
          axios.get<GetRawTransactionResult>(`${basePath}/extended/v1/tx/${txid}/raw`, { signal }),
        { signal, throwOnTimeout: true }
      );
      return resp.data;
    },
    async getTransactionById(txid: string, signal: AbortSignal) {
      const resp = await rateLimiter.add(
        () =>
          axios.get<MempoolTransaction | Transaction>(`${basePath}/extended/v1/tx/${txid}`, {
            signal,
          }),
        { signal, throwOnTimeout: true }
      );
      return resp.data;
    },
    async getFtMetadata(address: string, signal: AbortSignal) {
      const resp = await rateLimiter.add(
        () => axios.get<FtMetadataResponse>(`${basePath}/metadata/v1/ft/${address}`, { signal }),
        { signal, priority: 2, throwOnTimeout: true }
      );
      return resp.data;
    },
    async getNftMetadata(address: string, tokenId: number, signal: AbortSignal) {
      const resp = await rateLimiter.add(
        () =>
          axios.get<NftMetadataResponse>(`${basePath}/metadata/v1/nft/${address}/${tokenId}`, {
            signal,
          }),
        { signal, throwOnTimeout: true }
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
        { priority: 2, signal, throwOnTimeout: true }
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
            {
              signal,
            }
          ),
        { signal, throwOnTimeout: true }
      );
      return resp.data;
    },
    async getStx20Balances(address: string, signal: AbortSignal) {
      const resp = await rateLimiter.add(
        () =>
          axios.get<Stx20BalanceResponse>(`${STX20_API_BASE_URL_MAINNET}/balance/${address}`, {
            signal,
          }),
        { signal, priority: 1, throwOnTimeout: true }
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
