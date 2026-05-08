import type { Page } from '@playwright/test';

import { SBTC_EMILY_API_URL } from './constants';

const sbtcEmilyUrl = `${SBTC_EMILY_API_URL}/deposit*`;

export async function mockMainnetTestAccountSbtcDepositRequests(page: Page) {
  await page.route(sbtcEmilyUrl, route =>
    route.fulfill({
      json: {
        deposits: [],
      },
    })
  );
}

const testAccountRecipientHex = '0x1632864de61d8269090af3cf6ef12e2a94c882bfae';

const pendingDeposit = {
  amount: 100000,
  bitcoinTxOutputIndex: 0,
  bitcoinTxid: 'abc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  depositScript: '00',
  lastUpdateBlockHash: '0x0000000000000000000000000000000000000000000000000000000000000001',
  lastUpdateHeight: 200000,
  recipient: testAccountRecipientHex,
  reclaimScript: '00',
  status: 'pending',
};

const acceptedDeposit = {
  amount: 200000,
  bitcoinTxOutputIndex: 0,
  bitcoinTxid: 'def456abc123def456abc123def456abc123def456abc123def456abc123def4',
  depositScript: '00',
  lastUpdateBlockHash: '0x0000000000000000000000000000000000000000000000000000000000000002',
  lastUpdateHeight: 200001,
  recipient: testAccountRecipientHex,
  reclaimScript: '00',
  status: 'accepted',
};

const mockStacksBlock = {
  canonical: true,
  height: 200000,
  hash: '0xblockHash',
  block_time: Math.floor(Date.now() / 1000) - 3600,
  block_time_iso: new Date(Date.now() - 3600000).toISOString(),
  index_block_hash: '0x0000000000000000000000000000000000000000000000000000000000000001',
  parent_block_hash: '0x0000',
  parent_index_block_hash: '0x0000',
  burn_block_time: Math.floor(Date.now() / 1000) - 3600,
  burn_block_time_iso: new Date(Date.now() - 3600000).toISOString(),
  burn_block_hash: '0x0000',
  burn_block_height: 900000,
  miner_txid: '0x0000',
  tx_count: 1,
  execution_cost_read_count: 0,
  execution_cost_read_length: 0,
  execution_cost_runtime: 0,
  execution_cost_write_count: 0,
  execution_cost_write_length: 0,
};

export async function mockSbtcDepositsForActivity(page: Page) {
  await page.unroute(sbtcEmilyUrl);

  await page.route(`${SBTC_EMILY_API_URL}/deposit?status=pending`, route =>
    route.fulfill({ json: { deposits: [pendingDeposit] } })
  );

  await page.route(`${SBTC_EMILY_API_URL}/deposit?status=accepted`, route =>
    route.fulfill({ json: { deposits: [acceptedDeposit] } })
  );

  await page.route('**/extended/v2/blocks/200000', route =>
    route.fulfill({ json: mockStacksBlock })
  );

  await page.route('**/extended/v2/blocks/200001', route =>
    route.fulfill({ json: { ...mockStacksBlock, height: 200001 } })
  );
}
