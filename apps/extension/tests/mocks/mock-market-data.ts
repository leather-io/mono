import type { BrowserContext, Page } from '@playwright/test';

export async function mockMarketDataRequests(page: Page | BrowserContext) {
  await page.route('**/api.coingecko.com/api/v3/simple/price**', route =>
    route.fulfill({
      json: { bitcoin: { usd: 45000 } },
    })
  );

  await page.route('**/api1.binance.com/api/v3/ticker/price**', route =>
    route.fulfill({
      json: { symbol: 'BTCUSDT', price: '45000.00' },
    })
  );

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
