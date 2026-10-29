import type { BrowserContext, Page } from '@playwright/test';

export async function mockMarketDataRequests(page: Page | BrowserContext) {
  await page.route('**/leather.mempool.space/api/v1/prices', route =>
    route.fulfill({
      json: {
        time: 1760000000,
        USD: 45000,
        EUR: 40000,
        GBP: 35000,
        CAD: 60000,
        CHF: 40000,
        AUD: 65000,
        JPY: 6500000,
      },
    })
  );
}
