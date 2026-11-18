import type { BrowserContext, Page } from '@playwright/test';

import {
  SBTC_EMILY_API_URL,
  SBTC_SPONSORSHIP_API_URL,
  TEST_ACCOUNT_1_STX_ADDRESS_HEX,
} from './constants';

const sbtcEmilyUrl = `${SBTC_EMILY_API_URL}/deposit*`;

export type SbtcDepositStatus = 'pending' | 'accepted' | 'confirmed' | 'failed' | 'rbf';

export interface SbtcDepositFixture {
  amount: number;
  bitcoinTxOutputIndex: number;
  bitcoinTxid: string;
  depositScript: string;
  lastUpdateBlockHash: string;
  lastUpdateHeight: number;
  recipient: string;
  reclaimScript: string;
  status: SbtcDepositStatus;
}

interface CreateSbtcDepositFixtureArgs {
  bitcoinTxid: string;
  status: SbtcDepositStatus;
  amount?: number;
  recipient?: string;
}

export function createSbtcDepositFixture({
  bitcoinTxid,
  status,
  amount = 150_000,
  recipient = TEST_ACCOUNT_1_STX_ADDRESS_HEX,
}: CreateSbtcDepositFixtureArgs): SbtcDepositFixture {
  return {
    amount,
    bitcoinTxOutputIndex: 0,
    bitcoinTxid,
    depositScript: '0x00',
    lastUpdateBlockHash: '0x01',
    lastUpdateHeight: 810600,
    recipient,
    reclaimScript: '0x02',
    status,
  };
}

export async function mockMainnetTestAccountSbtcDepositRequests(page: Page | BrowserContext) {
  await page.route(sbtcEmilyUrl, route =>
    route.fulfill({
      json: {
        deposits: [],
      },
    })
  );

  await page.route(`${SBTC_SPONSORSHIP_API_URL}/verify`, route => route.fulfill({ json: false }));

  await page.route(`${SBTC_SPONSORSHIP_API_URL}/submit`, route =>
    route.fulfill({
      json: { txid: '9b709768122e6c62a37b087106cc9c23280ed6242b565484b6cc4e6a43ae1155' },
    })
  );
}

export async function mockSbtcDeposits(
  target: Page | BrowserContext,
  depositsByStatus: Partial<Record<SbtcDepositStatus, SbtcDepositFixture[]>>
) {
  await target.route(sbtcEmilyUrl, route => {
    const status = new URL(route.request().url()).searchParams.get('status');
    const deposits = Object.entries(depositsByStatus).find(([key]) => key === status)?.[1] ?? [];
    return route.fulfill({ json: { deposits } });
  });
}
