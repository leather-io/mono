import type {
  AddressTransactionsWithTransfersListResponse,
  MempoolTransactionListResponse,
  ReadOnlyFunctionArgs,
} from '@stacks/stacks-blockchain-api-types';
import { type ClarityAbi } from '@stacks/transactions';
import PQueue from 'p-queue';
import { z } from 'zod';

import { DEFAULT_LIST_LIMIT } from '@leather.io/constants';
import type { StacksTransaction } from '@leather.io/models';

import { fetchFn } from './hiro-wrapped-fetch';

const rateLimiterOptions = { interval: 1200, intervalCap: 6, timeout: 60000 };
const rateLimiters = new Map<string, PQueue>();

function getRateLimiter(apiUrl: string) {
  const existing = rateLimiters.get(apiUrl);
  if (existing) return existing;
  const limiter = new PQueue(rateLimiterOptions);
  rateLimiters.set(apiUrl, limiter);
  return limiter;
}

const stxAddressBalanceSchema = z.object({
  balance: z.string(),
  locked: z.string(),
});

const callReadOnlyFunctionResponseSchema = z.object({
  okay: z.boolean(),
  result: z.string().optional(),
  cause: z.string().optional(),
});

const addressTransactionsWithTransfersSchema =
  z.custom<AddressTransactionsWithTransfersListResponse>();
const mempoolTransactionsSchema = z.custom<MempoolTransactionListResponse>();
const stacksTransactionSchema = z.custom<StacksTransaction>();
const contractInterfaceSchema = z.custom<ClarityAbi>();

class StacksApiRequestError extends Error {
  constructor(
    readonly status: number,
    url: string
  ) {
    super(`Request to ${url} failed with status ${status}`);
    this.name = 'StacksApiRequestError';
  }
}

interface CallReadOnlyFunctionArgs {
  contractAddress: string;
  contractName: string;
  functionName: string;
  readOnlyFunctionArgs: ReadOnlyFunctionArgs;
  tip?: string;
  signal?: AbortSignal;
}

async function fetchJson(url: string, init: RequestInit, signal?: AbortSignal): Promise<unknown> {
  const response = await fetchFn(url, { ...init, signal });
  if (!response.ok) throw new StacksApiRequestError(response.status, url);
  return response.json();
}

export function createStacksApiClient(apiUrl: string) {
  const limiter = getRateLimiter(apiUrl);

  function get(path: string, signal?: AbortSignal) {
    return limiter.add(() => fetchJson(`${apiUrl}${path}`, {}, signal), {
      signal,
      throwOnTimeout: true,
    });
  }

  return {
    async getStxAddressBalance(address: string, signal: AbortSignal) {
      return stxAddressBalanceSchema.parse(
        await get(`/extended/v2/addresses/${address}/balances/stx`, signal)
      );
    },
    async getAccountTransactionsWithTransfers(address: string, signal: AbortSignal) {
      return addressTransactionsWithTransfersSchema.parse(
        await get(
          `/extended/v1/address/${address}/transactions_with_transfers?limit=${DEFAULT_LIST_LIMIT}`,
          signal
        )
      );
    },
    async getAddressMempoolTransactions(address: string, signal: AbortSignal) {
      return mempoolTransactionsSchema.parse(
        await get(`/extended/v1/tx/mempool?address=${address}&limit=${DEFAULT_LIST_LIMIT}`, signal)
      );
    },
    async getTransactionById(txid: string, signal: AbortSignal) {
      return stacksTransactionSchema.parse(await get(`/extended/v3/transactions/${txid}`, signal));
    },
    async getContractInterface(
      contractAddress: string,
      contractName: string,
      signal?: AbortSignal
    ) {
      return contractInterfaceSchema.parse(
        await get(`/v2/contracts/interface/${contractAddress}/${contractName}`, signal)
      );
    },
    async callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName,
      readOnlyFunctionArgs,
      tip,
      signal,
    }: CallReadOnlyFunctionArgs) {
      const tipQuery = tip ? `?tip=${tip}` : '';
      return callReadOnlyFunctionResponseSchema.parse(
        await limiter.add(
          () =>
            fetchJson(
              `${apiUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}${tipQuery}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(readOnlyFunctionArgs),
              },
              signal
            ),
          { signal, throwOnTimeout: true }
        )
      );
    },
  };
}

export type StacksApiClient = ReturnType<typeof createStacksApiClient>;
