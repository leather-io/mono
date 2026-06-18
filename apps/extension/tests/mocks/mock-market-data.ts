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
}
