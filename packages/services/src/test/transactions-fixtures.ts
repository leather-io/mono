import { type MempoolTokenTransferTransaction } from '@stacks/stacks-blockchain-api-types';

import { type NetworkConfiguration } from '@leather.io/models';

import { type HiroPrincipalMempoolTransaction } from '../infrastructure/api/hiro/hiro-stacks-api.types';
import {
  type LeatherApiBitcoinTransaction,
  type LeatherApiClient,
} from '../infrastructure/api/leather/leather-api.client';
import { type SettingsService } from '../infrastructure/settings/settings.service';

type LeatherApiBitcoinTransactionsPage = Awaited<
  ReturnType<LeatherApiClient['fetchBitcoinTransactions']>
>;

export function createTestSettingsService(network: NetworkConfiguration): SettingsService {
  return {
    getSettings() {
      return { network, quoteCurrency: 'USD', assetVisibility: {} };
    },
  };
}

export function createTestLeatherBitcoinTransaction(
  overrides: Partial<LeatherApiBitcoinTransaction> & Pick<LeatherApiBitcoinTransaction, 'txid'>
): LeatherApiBitcoinTransaction {
  return {
    vin: [],
    vout: [],
    ...overrides,
  };
}

export function createTestLeatherBitcoinTransactionsPage(
  data: LeatherApiBitcoinTransaction[]
): LeatherApiBitcoinTransactionsPage {
  return {
    data,
    meta: { page: 1, pageSize: data.length, totalPages: 1, totalItems: data.length },
  };
}

export function createTestMempoolTokenTransferTransaction(
  overrides: Partial<MempoolTokenTransferTransaction> = {}
): MempoolTokenTransferTransaction {
  return {
    tx_id: '0x00',
    nonce: 0,
    fee_rate: '0',
    sender_address: 'SP000000000000000000002Q6VF78',
    sponsored: false,
    post_condition_mode: 'deny',
    post_conditions: [],
    anchor_mode: 'any',
    tx_status: 'pending',
    receipt_time: 0,
    receipt_time_iso: '1970-01-01T00:00:00.000Z',
    tx_type: 'token_transfer',
    token_transfer: {
      recipient_address: 'SP000000000000000000002Q6VF78',
      amount: '0',
      memo: '',
    },
    ...overrides,
  };
}

type HiroPrincipalMempoolTokenTransferTransaction = Extract<
  HiroPrincipalMempoolTransaction,
  { type: 'token_transfer' }
>;
type HiroPrincipalMempoolContractCallTransaction = Extract<
  HiroPrincipalMempoolTransaction,
  { type: 'contract_call' }
>;
type HiroPrincipalMempoolSmartContractTransaction = Extract<
  HiroPrincipalMempoolTransaction,
  { type: 'smart_contract' }
>;

function createTestPrincipalMempoolFields(): Omit<
  HiroPrincipalMempoolTokenTransferTransaction,
  'type' | 'token_transfer'
> {
  return {
    tx_id: '0x00',
    sender: { address: 'SP000000000000000000002Q6VF78', nonce: 0 },
    sponsor: null,
    fee_rate: '0',
    receipt_time: 0,
    receipt_time_iso: '1970-01-01T00:00:00.000Z',
    receipt_block_height: 0,
    status: 'pending',
  };
}

export function createTestPrincipalMempoolTokenTransferTx(
  overrides: Partial<HiroPrincipalMempoolTokenTransferTransaction> = {}
): HiroPrincipalMempoolTokenTransferTransaction {
  return {
    ...createTestPrincipalMempoolFields(),
    type: 'token_transfer',
    token_transfer: { recipient: 'SP000000000000000000002Q6VF78', amount: '0', memo: null },
    ...overrides,
  };
}

export function createTestPrincipalMempoolContractCallTx(
  overrides: Partial<HiroPrincipalMempoolContractCallTransaction> = {}
): HiroPrincipalMempoolContractCallTransaction {
  return {
    ...createTestPrincipalMempoolFields(),
    type: 'contract_call',
    contract_call: {
      contract_id: 'SP000000000000000000002Q6VF78.pox-4',
      function_name: 'stack-stx',
    },
    ...overrides,
  };
}

export function createTestPrincipalMempoolSmartContractTx(
  overrides: Partial<HiroPrincipalMempoolSmartContractTransaction> = {}
): HiroPrincipalMempoolSmartContractTransaction {
  return {
    ...createTestPrincipalMempoolFields(),
    type: 'smart_contract',
    smart_contract: { contract_id: 'SP000000000000000000002Q6VF78.contract', clarity_version: 3 },
    ...overrides,
  };
}
