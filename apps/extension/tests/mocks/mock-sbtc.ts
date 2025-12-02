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
