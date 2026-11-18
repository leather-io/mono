import type { BrowserContext, Page } from '@playwright/test';

import { TEST_ACCOUNT_1_STX_ADDRESS } from './constants';

const emptyPrincipalNftBalancesResponse = {
  limit: 200,
  total: 0,
  cursor: { next: null, previous: null, current: null },
  results: [],
};

export async function mockMainnetTestAccountStacksNFTsRequest(page: Page | BrowserContext) {
  await page.route('**hiro.so/extended/v3/principals/*/balances/nft**', route =>
    route.fulfill({ json: emptyPrincipalNftBalancesResponse })
  );
  await page.route(
    `**/api.hiro.so/extended/v3/principals/${TEST_ACCOUNT_1_STX_ADDRESS}/balances/nft**`,
    route => route.fulfill({ json: emptyPrincipalNftBalancesResponse })
  );
}
