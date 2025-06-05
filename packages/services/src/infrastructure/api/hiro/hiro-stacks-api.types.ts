import { FtMetadataResponse, NftMetadataResponse } from '@hirosystems/token-metadata-api-client';
import {
  AddressAssetsListResponse,
  AddressBalanceResponse,
  AddressTransactionWithTransfers,
  AddressTransactionsWithTransfersListResponse,
  MempoolTransaction,
  MempoolTransactionListResponse,
  NonFungibleTokenHolding,
  Transaction,
  TransactionEvent,
} from '@stacks/stacks-blockchain-api-types';

export interface HiroPageRequest {
  limit: number;
  offset: number;
}
export interface HiroPageResponse<T> {
  limit: number;
  offset: number;
  total: number;
  results: T[];
}

export type HiroAddressTransactionsResponse = AddressTransactionsWithTransfersListResponse;
export type HiroAddressTransactionWithTransfers = AddressTransactionWithTransfers;
export type HiroAddressTransaction = AddressTransactionWithTransfers;
export type HiroAddressBalanceResponse = AddressBalanceResponse;
export type HiroMempoolTransactionListResponse = MempoolTransactionListResponse;
export type HiroFtMetadataResponse = FtMetadataResponse;
export type HiroNftMetadataResponse = NftMetadataResponse;
export type HiroTransactionEvent = TransactionEvent;
export type HiroTransactionEventsResponse = AddressAssetsListResponse;
export type HiroStacksTransaction = Transaction;
export type HiroStacksMempoolTransaction = MempoolTransaction;
export type HiroNftHolding = NonFungibleTokenHolding;

export interface HiroAddressStxBalanceResponse {
  balance: string;
  total_miner_rewards_received: string;
  lock_tx_id: string;
  locked: string;
  lock_height: number;
  burnchain_lock_height: number;
  burnchain_unlock_height: number;
}

export interface HiroAddressFtBalanceResult {
  token: string;
  balance: string;
}

export type HiroAddressFtBalancesResponse = HiroPageResponse<HiroAddressFtBalanceResult>;
