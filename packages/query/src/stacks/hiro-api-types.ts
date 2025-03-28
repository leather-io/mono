import { ReadOnlyFunctionArgs } from '@stacks/stacks-blockchain-api-types';

import { Paginated } from '../../types/api-types';

export interface CallReadOnlyFunctionArgs {
  contractAddress: string;
  contractName: string;
  functionName: string;
  readOnlyFunctionArgs: ReadOnlyFunctionArgs;
  tip?: string;
  signal?: AbortSignal;
}

export interface HiroStxAddressBalanceResponse {
  balance: string;
  estimated_balance: string;
  pending_balance_inbound: string;
  pending_balance_outbound: string;
  total_sent: string;
  total_received: string;
  total_fees_sent: string;
  total_miner_rewards_received: string;
  lock_tx_id: string;
  locked: string;
  lock_height: number;
  burnchain_lock_height: number;
  burnchain_unlock_height: number;
}

export interface HiroSip10AddressBalanceResult {
  token: string;
  balance: string;
}

export type HiroSip10AddressBalancesResponse = Paginated<HiroSip10AddressBalanceResult[]>;

export interface FeeEstimation {
  fee: number;
  fee_rate: number;
}

export interface StacksTxFeeEstimation {
  cost_scalar_change_by_byte: number;
  estimated_cost: object;
  estimated_cost_scalar: number;
  estimations: FeeEstimation[];
  error?: string;
}

export interface NonFungibleTokenHoldingListResult {
  asset_identifier: string;
  block_height: number;
  tx_id: string;
  value: {
    hex: string;
    repr: string;
  };
}

export type NonFungibleTokenHoldingsResponse = Paginated<NonFungibleTokenHoldingListResult[]>;
