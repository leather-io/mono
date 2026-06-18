import type { BrowserContext, Page } from '@playwright/test';

import { SBTC_EMILY_API_URL, SBTC_SPONSORSHIP_API_URL } from './constants';

const sbtcEmilyUrl = `${SBTC_EMILY_API_URL}/deposit*`;

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
