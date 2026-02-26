import type { Page } from '@playwright/test';

import { TEST_ACCOUNT_1_STX_ADDRESS } from './constants';

const nowSeconds = Math.floor(Date.now() / 1000);
const yesterdaySeconds = nowSeconds - 86400;
const olderSeconds = nowSeconds - 86400 * 5;

const commonTxFields = {
  nonce: 10,
  fee_rate: '2000',
  sponsored: false,
  post_condition_mode: 'deny',
  post_conditions: [],
  anchor_mode: 'any',
  canonical: true,
  tx_index: 1,
  tx_result: { hex: '0x0703', repr: '(ok true)' },
  event_count: 0,
  is_unanchored: false,
  microblock_hash: '0x',
  microblock_sequence: 2147483647,
  microblock_canonical: true,
  execution_cost_read_count: 0,
  execution_cost_read_length: 0,
  execution_cost_runtime: 0,
  execution_cost_write_count: 0,
  execution_cost_write_length: 0,
  events: [],
  parent_block_hash: '0xabc123',
  parent_burn_block_time: nowSeconds - 600,
  parent_burn_block_time_iso: new Date((nowSeconds - 600) * 1000).toISOString(),
};

const confirmedStxSend = {
  tx: {
    ...commonTxFields,
    tx_id: '0xaaa1110000000000000000000000000000000000000000000000000000000001',
    sender_address: TEST_ACCOUNT_1_STX_ADDRESS,
    tx_status: 'success',
    tx_type: 'token_transfer',
    block_hash: '0xblock111',
    block_height: 200001,
    block_time: nowSeconds - 3600,
    block_time_iso: new Date((nowSeconds - 3600) * 1000).toISOString(),
    burn_block_time: nowSeconds - 3600,
    burn_block_height: 900001,
    burn_block_time_iso: new Date((nowSeconds - 3600) * 1000).toISOString(),
    token_transfer: {
      recipient_address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      amount: '5000000',
      memo: '0x00000000000000000000000000000000000000000000000000000000000000000000',
    },
  },
  stx_sent: '5000000',
  stx_received: '0',
  stx_transfers: [
    {
      sender: TEST_ACCOUNT_1_STX_ADDRESS,
      recipient: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      amount: '5000000',
    },
  ],
  ft_transfers: [],
  nft_transfers: [],
};

const confirmedStxReceive = {
  tx: {
    ...commonTxFields,
    tx_id: '0xbbb2220000000000000000000000000000000000000000000000000000000002',
    sender_address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
    tx_status: 'success',
    tx_type: 'token_transfer',
    block_hash: '0xblock222',
    block_height: 200000,
    block_time: yesterdaySeconds,
    block_time_iso: new Date(yesterdaySeconds * 1000).toISOString(),
    burn_block_time: yesterdaySeconds,
    burn_block_height: 900000,
    burn_block_time_iso: new Date(yesterdaySeconds * 1000).toISOString(),
    token_transfer: {
      recipient_address: TEST_ACCOUNT_1_STX_ADDRESS,
      amount: '2000000',
      memo: '0x00000000000000000000000000000000000000000000000000000000000000000000',
    },
  },
  stx_sent: '0',
  stx_received: '2000000',
  stx_transfers: [
    {
      sender: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      recipient: TEST_ACCOUNT_1_STX_ADDRESS,
      amount: '2000000',
    },
  ],
  ft_transfers: [],
  nft_transfers: [],
};

const confirmedContractCall = {
  tx: {
    ...commonTxFields,
    tx_id: '0xccc3330000000000000000000000000000000000000000000000000000000003',
    sender_address: TEST_ACCOUNT_1_STX_ADDRESS,
    tx_status: 'success',
    tx_type: 'contract_call',
    block_hash: '0xblock333',
    block_height: 199999,
    block_time: olderSeconds,
    block_time_iso: new Date(olderSeconds * 1000).toISOString(),
    burn_block_time: olderSeconds,
    burn_block_height: 899999,
    burn_block_time_iso: new Date(olderSeconds * 1000).toISOString(),
    contract_call: {
      contract_id: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR.amm-swap-pool-v1-1',
      function_name: 'swap-helper',
      function_signature: '',
      function_args: [],
    },
  },
  stx_sent: '0',
  stx_received: '0',
  stx_transfers: [],
  ft_transfers: [],
  nft_transfers: [],
};

const confirmedSmartContractDeploy = {
  tx: {
    ...commonTxFields,
    tx_id: '0xddd4440000000000000000000000000000000000000000000000000000000004',
    sender_address: TEST_ACCOUNT_1_STX_ADDRESS,
    tx_status: 'success',
    tx_type: 'smart_contract',
    block_hash: '0xblock444',
    block_height: 199998,
    block_time: olderSeconds - 3600,
    block_time_iso: new Date((olderSeconds - 3600) * 1000).toISOString(),
    burn_block_time: olderSeconds - 3600,
    burn_block_height: 899998,
    burn_block_time_iso: new Date((olderSeconds - 3600) * 1000).toISOString(),
    smart_contract: {
      clarity_version: 2,
      contract_id: `${TEST_ACCOUNT_1_STX_ADDRESS}.my-token-contract`,
      source_code: '',
    },
  },
  stx_sent: '0',
  stx_received: '0',
  stx_transfers: [],
  ft_transfers: [],
  nft_transfers: [],
};

const mockedActivityTransactions = [
  confirmedStxSend,
  confirmedStxReceive,
  confirmedContractCall,
  confirmedSmartContractDeploy,
];

const v2TransactionsUrl = `**/api.hiro.so/extended/v2/addresses/${TEST_ACCOUNT_1_STX_ADDRESS}/transactions?**`;

export async function mockTestAccountActivityTransactions(page: Page) {
  await page.route(v2TransactionsUrl, route =>
    route.fulfill({
      json: {
        limit: 50,
        offset: 0,
        total: mockedActivityTransactions.length,
        results: mockedActivityTransactions,
      },
    })
  );
}
