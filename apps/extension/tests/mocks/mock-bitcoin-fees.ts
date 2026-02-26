import type { Page } from '@playwright/test';

export async function mockBitcoinFeeRequests(page: Page) {
  await Promise.all([
    page.route('**/mempool.space/api/v1/fees/recommended', route =>
      route.fulfill({
        json: {
          fastestFee: 15,
          halfHourFee: 10,
          hourFee: 5,
          economyFee: 2,
          minimumFee: 1,
        },
      })
    ),
    page.route('**/mempool.space/testnet*/api/v1/fees/recommended', route =>
      route.fulfill({
        json: {
          fastestFee: 15,
          halfHourFee: 10,
          hourFee: 5,
          economyFee: 2,
          minimumFee: 1,
        },
      })
    ),
    page.route('**/api.blockcypher.com/v1/btc/*', route =>
      route.fulfill({
        json: {
          name: 'BTC.main',
          height: 919341,
          hash: '000000000000000000000000000000000000000000000000000000000000dead',
          time: '2025-01-01T00:00:00Z',
          latest_url: '',
          previous_hash: '',
          previous_url: '',
          peer_count: 100,
          unconfirmed_count: 1000,
          high_fee_per_kb: 15000,
          medium_fee_per_kb: 10000,
          low_fee_per_kb: 5000,
          last_fork_height: 0,
          last_fork_hash: '',
        },
      })
    ),
  ]);
}
