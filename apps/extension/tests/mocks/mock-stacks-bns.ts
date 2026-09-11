import type { BrowserContext, Page } from '@playwright/test';

import { TEST_ACCOUNT_1_STX_ADDRESS } from './constants';

const mockedBnsV2NamesResponseEmpty = {
  total: 0,
  current_burn_block: 869830,
  limit: 50,
  offset: 0,
  names: [],
};

const mockedBnsV2NamesResponse = {
  total: 1,
  current_burn_block: 869830,
  limit: 50,
  offset: 0,
  names: [
    {
      full_name: 'leather.btc',
      name_string: 'leather',
      namespace_string: 'btc',
      owner: 'leather',
      registered_at: '2021-09-29T20:00:00Z',
      renewal_height: 'sdlkfsldjks',
      stx_burn: '0',
      revoked: false,
    },
  ],
};

export async function mockBnsV2NamesRequestEmpty(page: Page | BrowserContext) {
  await page.route(`**/api.bnsv2.com/names/address/*/valid`, route =>
    route.fulfill({ json: mockedBnsV2NamesResponseEmpty })
  );
}

export async function mockBnsV2NamesRequest(page: Page | BrowserContext) {
  await page.route(`**/api.bnsv2.com/names/address/${TEST_ACCOUNT_1_STX_ADDRESS}/valid`, route =>
    route.fulfill({ json: mockedBnsV2NamesResponse })
  );
}

export function mockBnsV2NameLookup(page: Page | BrowserContext) {
  return function ({ name, fullName, owner }: { name: string; fullName: string; owner: string }) {
    return page.route(`**/api.bnsv2.com/names/${fullName}`, route =>
      route.fulfill({
        json: {
          current_burn_block: 900937,
          status: 'active',
          data: {
            name_string: name,
            namespace_string: 'btc',
            full_name: fullName,
            owner,
            registered_at: '17467',
            renewal_height: '1125982',
            stx_burn: '0',
            revoked: false,
            imported_at: 'none',
            preordered_by: 'none',
            is_valid: true,
          },
        },
      })
    );
  };
}
