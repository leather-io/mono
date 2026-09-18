import { Metadata } from '@hirosystems/token-metadata-api-client';
import {
  AddressAssetsListResponse,
  AddressBalanceResponse,
  AddressTransactionWithTransfers,
  AddressTransactionsWithTransfersListResponse,
  MempoolTransaction,
  MempoolTransactionListResponse,
  NonFungibleTokenHolding,
  ServerStatusResponse,
  Transaction,
  TransactionEvent,
  TransactionFeeEstimateResponse,
} from '@stacks/stacks-blockchain-api-types';
import { ClarityValue } from '@stacks/transactions';

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

// Hiro v3 `/extended/v3/principals/{principal}/transactions` — slim, cursor-paged tx data.
export type HiroPrincipalTxStatus = 'success' | 'abort_by_response' | 'abort_by_post_condition';

interface HiroPrincipalTxParty {
  readonly address: string;
  readonly nonce: number;
}

interface HiroPrincipalTxBase {
  readonly tx_id: string;
  readonly sender: HiroPrincipalTxParty;
  readonly sponsor: HiroPrincipalTxParty | null;
  readonly fee_rate: string;
  readonly block: {
    readonly height: number;
    readonly hash: string;
    readonly index_hash: string;
    readonly time: number;
    readonly tx_index: number;
  };
  readonly bitcoin_block: { readonly height: number; readonly time: number };
  readonly status: HiroPrincipalTxStatus;
}

interface HiroPrincipalTokenTransferTx extends HiroPrincipalTxBase {
  readonly type: 'token_transfer';
  readonly token_transfer: {
    readonly recipient: string;
    readonly amount: string;
    readonly memo: string | null;
  };
}

interface HiroPrincipalContractCallTx extends HiroPrincipalTxBase {
  readonly type: 'contract_call';
  readonly contract_call: {
    readonly contract_id: string;
    readonly function_name: string;
  };
}

interface HiroPrincipalSmartContractTx extends HiroPrincipalTxBase {
  readonly type: 'smart_contract';
  readonly smart_contract: {
    readonly contract_id: string;
    readonly clarity_version: number | null;
  };
}

interface HiroPrincipalCoinbaseTx extends HiroPrincipalTxBase {
  readonly type: 'coinbase';
  readonly coinbase: { readonly alt_recipient: string | null };
}

interface HiroPrincipalTenureChangeTx extends HiroPrincipalTxBase {
  readonly type: 'tenure_change';
  readonly tenure_change: { readonly cause: string };
}

interface HiroPrincipalPoisonMicroblockTx extends HiroPrincipalTxBase {
  readonly type: 'poison_microblock';
}

export type HiroPrincipalTransaction =
  | HiroPrincipalTokenTransferTx
  | HiroPrincipalContractCallTx
  | HiroPrincipalSmartContractTx
  | HiroPrincipalCoinbaseTx
  | HiroPrincipalTenureChangeTx
  | HiroPrincipalPoisonMicroblockTx;

export interface HiroPrincipalTransactionsResultItem {
  readonly transaction: HiroPrincipalTransaction;
  readonly involvement: 'sender' | 'sponsor' | 'affected';
  readonly balance_changes: {
    readonly stx: { readonly sent: string; readonly received: string; readonly net: string };
  };
  readonly affected_balances: {
    readonly stx: boolean;
    readonly ft: boolean;
    readonly nft: boolean;
  };
}

export interface HiroPrincipalTransactionsResponse {
  readonly total: number;
  readonly limit: number;
  readonly cursor: {
    readonly next: string | null;
    readonly previous: string | null;
    readonly current: string | null;
  };
  readonly results: HiroPrincipalTransactionsResultItem[];
}

export interface HiroBalanceChangeResultItem {
  readonly tx_id: string;
  readonly asset:
    | { readonly type: 'stx' }
    | { readonly type: 'ft'; readonly identifier: string }
    | { readonly type: 'nft'; readonly identifier: string };
  readonly balance_change: {
    readonly sent: string;
    readonly received: string;
    readonly net: string;
  };
}

export interface HiroBalanceChangesResponse {
  readonly total: number;
  readonly limit: number;
  readonly cursor: {
    readonly next: string | null;
    readonly previous: string | null;
    readonly current: string | null;
  };
  readonly results: HiroBalanceChangeResultItem[];
}
export type HiroAddressBalanceResponse = AddressBalanceResponse;
export type HiroMempoolTransactionListResponse = MempoolTransactionListResponse;
export type HiroMetadata = Metadata;
export type HiroTransactionEvent = TransactionEvent;
export type HiroTransactionEventsResponse = AddressAssetsListResponse;
export type HiroStacksTransaction = Transaction;
export type HiroStacksMempoolTransaction = MempoolTransaction;
export type HiroNftHolding = NonFungibleTokenHolding;
export type HiroReadOnlyFunctionResponse =
  | { okay: true; result: string }
  | { okay: false; cause: string };
export type HiroTransactionFeeEstimateResponse = TransactionFeeEstimateResponse;
export type HiroServerStatusResponse = ServerStatusResponse;

export interface HiroAddressStxBalanceResponse {
  balance: string;
  total_miner_rewards_received: string;
  lock_tx_id: string;
  locked: string;
  lock_height: number;
  burnchain_lock_height: number;
  burnchain_unlock_height: number;
}

interface HiroAddressFtBalanceResult {
  token: string;
  balance: string;
}

export type HiroAddressFtBalancesResponse = HiroPageResponse<HiroAddressFtBalanceResult>;

export interface CallReadOnlyFunctionArgs {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: ClarityValue[];
  senderAddress?: string;
  tip?: string;
}

interface HiroCursorPageResponse<T> {
  total: number;
  limit: number;
  cursor: { next: string | null; previous: string | null; current: string | null };
  results: T[];
}

type HiroStakingBondStatus = 'upcoming' | 'active' | 'unlocked';

interface HiroStakingBondSchedulePoint {
  bitcoin_height: number;
  pox_cycle: number;
}

export interface HiroStakingBond {
  index: number;
  pox_version: string;
  status: HiroStakingBondStatus;
  parameters: {
    target_rate_bps: number;
    stx_value_ratio: number;
    minimum_stx_ratio: number;
    btc_capacity: string;
  };
  registrations: { allowed_count: number; registered_count: number };
  schedule: { activation: HiroStakingBondSchedulePoint; unlock: HiroStakingBondSchedulePoint };
  balances: { locked: { btc: string; stx: string }; paid_out: { btc: string } };
}

export interface HiroStakingBondDetail extends HiroStakingBond {
  transaction: {
    tx_id: string;
    block: { height: number; hash: string; index_hash: string; time: number; tx_index: number };
    bitcoin_block: { height: number; time: number };
  };
}

export type HiroStakingBondsResponse = HiroCursorPageResponse<HiroStakingBond>;

export interface HiroPrincipalStakingBond {
  bond_index: number;
  status: string;
  active: boolean;
  enrollment: { tx_id: string; btc_lockup: { amount: string } };
  locked: { btc: string; stx: string };
  rewards: { btc: { accrued: string; claimed: string; claimable: string } };
}

export type HiroPrincipalStakingBondsResponse = HiroCursorPageResponse<HiroPrincipalStakingBond>;

export interface HiroPoxInfoResponse {
  contract_id: string;
  first_burnchain_block_height: number;
  current_burnchain_block_height: number;
  prepare_phase_block_length: number;
  reward_phase_block_length: number;
}
