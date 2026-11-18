import type {
  BaseTransaction,
  ContractCallTransaction,
  MempoolTokenTransferTransaction,
  PostConditionFungible,
  PostConditionNonFungible,
  PostConditionStx,
  SmartContractTransaction,
  TokenTransferTransaction,
  TransactionEventFungibleAsset,
  TransactionEventNonFungibleAsset,
  TransactionEventSmartContractLog,
  TransactionEventStxAsset,
} from '@stacks/stacks-blockchain-api-types';

import type {
  BitcoinTransaction,
  BlockchainActivity,
  BlockchainActivityBalanceChange,
  GeneralActivity,
  Sip10Asset,
} from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import type { HiroStacksTransaction } from '../infrastructure/api/hiro/hiro-stacks-api.types';

export function createActivitySip10Asset(overrides: Partial<Sip10Asset> = {}): Sip10Asset {
  return {
    category: 'fungible',
    protocol: 'sip10',
    chain: 'stacks',
    name: 'Token',
    symbol: 'TOK',
    decimals: 6,
    hasMemo: false,
    canTransfer: true,
    assetId: 'SP.token::tok',
    contractId: 'SP.token',
    imageCanonicalUri: '',
    ...overrides,
  };
}

export function createActivityGeneral(overrides: Partial<GeneralActivity> = {}): GeneralActivity {
  return {
    level: 'app',
    type: 'walletAdded',
    timestamp: 0,
    title: '',
    message: '',
    ...overrides,
  };
}

export function createActivityBalanceChange(
  overrides: Partial<BlockchainActivityBalanceChange> = {}
): BlockchainActivityBalanceChange {
  return {
    direction: 'received',
    asset: createActivitySip10Asset(),
    amount: { crypto: createMoney(0, 'STX'), quote: createMoney(0, 'USD') },
    ...overrides,
  };
}

export function createActivityBlockchain(
  overrides: Partial<BlockchainActivity> = {}
): BlockchainActivity {
  return {
    timestamp: 0,
    txid: '',
    status: 'success',
    chain: 'stacks',
    initiatedByUser: false,
    action: 'send',
    balanceChanges: [],
    ...overrides,
  };
}

export function createActivityBitcoinTx(
  overrides: Partial<BitcoinTransaction> = {}
): BitcoinTransaction {
  return {
    txid: '',
    vin: [],
    vout: [],
    ...overrides,
  };
}

function createBaseFields(): BaseTransaction {
  return {
    tx_id: '',
    nonce: 0,
    fee_rate: '0',
    sender_address: '',
    sponsored: false,
    post_condition_mode: 'deny',
    post_conditions: [],
    anchor_mode: 'any',
  };
}

function createAnchoredFields() {
  return {
    ...createBaseFields(),
    block_hash: '',
    block_height: 0,
    block_time: 0,
    block_time_iso: '',
    burn_block_height: 0,
    burn_block_time: 0,
    burn_block_time_iso: '',
    parent_burn_block_time: 0,
    parent_burn_block_time_iso: '',
    canonical: true,
    tx_index: 0,
    tx_status: 'success' as const,
    tx_result: { hex: '', repr: '' },
    event_count: 0,
    parent_block_hash: '',
    is_unanchored: false,
    microblock_hash: '',
    microblock_sequence: 0,
    microblock_canonical: true,
    execution_cost_read_count: 0,
    execution_cost_read_length: 0,
    execution_cost_runtime: 0,
    execution_cost_write_count: 0,
    execution_cost_write_length: 0,
    events: [],
  };
}

function createMempoolFields() {
  return {
    ...createBaseFields(),
    tx_status: 'pending' as const,
    receipt_time: 0,
    receipt_time_iso: '',
  };
}

export function createActivityTokenTransferTx(
  overrides: Partial<TokenTransferTransaction> = {}
): TokenTransferTransaction {
  return {
    ...createAnchoredFields(),
    tx_type: 'token_transfer',
    token_transfer: { recipient_address: '', amount: '0', memo: '' },
    ...overrides,
  };
}

export function createActivityContractCallTx(
  overrides: Partial<ContractCallTransaction> = {}
): ContractCallTransaction {
  return {
    ...createAnchoredFields(),
    tx_type: 'contract_call',
    contract_call: { contract_id: '', function_name: '', function_signature: '' },
    ...overrides,
  };
}

export function createActivitySmartContractTx(
  overrides: Partial<SmartContractTransaction> = {}
): SmartContractTransaction {
  return {
    ...createAnchoredFields(),
    tx_type: 'smart_contract',
    smart_contract: { contract_id: '', source_code: '' },
    ...overrides,
  };
}

export function createActivityMempoolTokenTransferTx(
  overrides: Partial<MempoolTokenTransferTransaction> = {}
): MempoolTokenTransferTransaction {
  return {
    ...createMempoolFields(),
    tx_type: 'token_transfer',
    token_transfer: { recipient_address: '', amount: '0', memo: '' },
    ...overrides,
  };
}

export function removeActivityBlockTimes<T extends HiroStacksTransaction>(
  tx: T,
  fields: ('block_time' | 'burn_block_time')[]
): T {
  fields.forEach(field => Reflect.deleteProperty(tx, field));
  return tx;
}

export function createActivityStxAssetEvent(
  overrides: Partial<TransactionEventStxAsset> = {}
): TransactionEventStxAsset {
  return {
    event_index: 0,
    event_type: 'stx_asset',
    tx_id: '',
    asset: {},
    ...overrides,
  };
}

export function createActivityFtAssetEvent(
  asset: Partial<TransactionEventFungibleAsset['asset']> = {},
  overrides: Partial<TransactionEventFungibleAsset> = {}
): TransactionEventFungibleAsset {
  return {
    event_index: 0,
    event_type: 'fungible_token_asset',
    tx_id: '',
    asset: {
      asset_event_type: 'transfer',
      asset_id: '',
      sender: '',
      recipient: '',
      amount: '0',
      ...asset,
    },
    ...overrides,
  };
}

export function createActivityNftAssetEvent(
  asset: Partial<TransactionEventNonFungibleAsset['asset']> = {},
  overrides: Partial<TransactionEventNonFungibleAsset> = {}
): TransactionEventNonFungibleAsset {
  return {
    event_index: 0,
    event_type: 'non_fungible_token_asset',
    tx_id: '',
    asset: {
      asset_event_type: 'transfer',
      asset_id: '',
      sender: '',
      recipient: '',
      value: { hex: '', repr: '' },
      ...asset,
    },
    ...overrides,
  };
}

export function createActivitySmartContractLogEvent(
  overrides: Partial<TransactionEventSmartContractLog> = {}
): TransactionEventSmartContractLog {
  return {
    event_index: 0,
    event_type: 'smart_contract_log',
    tx_id: '',
    contract_log: { contract_id: '', topic: '', value: { hex: '', repr: '' } },
    ...overrides,
  };
}

export function createActivityStxPostCondition(
  overrides: Partial<PostConditionStx> = {}
): PostConditionStx {
  return {
    type: 'stx',
    principal: { type_id: 'principal_origin' },
    condition_code: 'sent_equal_to',
    amount: '0',
    ...overrides,
  };
}

export function createActivityFtPostCondition(
  overrides: Partial<PostConditionFungible> = {}
): PostConditionFungible {
  return {
    type: 'fungible',
    principal: { type_id: 'principal_origin' },
    condition_code: 'sent_equal_to',
    amount: '0',
    asset: { asset_name: '', contract_address: '', contract_name: '' },
    ...overrides,
  };
}

export function createActivityNftPostCondition(
  overrides: Partial<PostConditionNonFungible> = {}
): PostConditionNonFungible {
  return {
    type: 'non_fungible',
    principal: { type_id: 'principal_origin' },
    condition_code: 'sent',
    asset_value: { hex: '', repr: '' },
    asset: { asset_name: '', contract_address: '', contract_name: '' },
    ...overrides,
  };
}
