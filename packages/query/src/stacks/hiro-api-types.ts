import { ContractInterfaceFunction } from '@stacks/rpc-client';
import { ContractInterfaceResponse } from '@stacks/stacks-blockchain-api-types';
import type { AddressTokenOfferingLocked } from '@stacks/stacks-blockchain-api-types/generated';

export type SelectedKeys =
  | 'balance'
  | 'total_sent'
  | 'total_received'
  | 'total_fees_sent'
  | 'total_miner_rewards_received'
  | 'locked';

export type AccountBalanceStxKeys = keyof Pick<AddressBalanceResponse['stx'], SelectedKeys>;

export const accountBalanceStxKeys: AccountBalanceStxKeys[] = [
  'balance',
  'total_sent',
  'total_received',
  'total_fees_sent',
  'total_miner_rewards_received',
  'locked',
];

/**
 * This is a duplicated type from the types lib/generated API client
 * We define it client side, as the library-returned types are not accurate
 */
export interface AddressBalanceResponse {
  stx: {
    balance: string;
    total_sent: string;
    total_received: string;
    total_fees_sent: string;
    total_miner_rewards_received: string;
    lock_tx_id: string;
    locked: string;
    lock_height: number;
    burnchain_lock_height: number;
    burnchain_unlock_height: number;
  };
  fungible_tokens: Record<
    string,
    {
      balance: string;
      total_sent: string;
      total_received: string;
    }
  >;
  non_fungible_tokens: Record<
    string,
    {
      count: string;
      total_sent: string;
      total_received: string;
    }
  >;
  token_offering_locked?: AddressTokenOfferingLocked;
}

export type ContractInterfaceResponseWithFunctions = Omit<
  ContractInterfaceResponse,
  'functions'
> & {
  functions: ContractInterfaceFunction[];
};

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
