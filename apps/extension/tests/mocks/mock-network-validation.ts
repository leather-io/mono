import type { BrowserContext, Page } from '@playwright/test';

const testnetChainInfo = {
  network_id: 2147483648,
  parent_network_id: 3669344250,
  stacks_tip_height: 3500000,
  burn_block_height: 4700000,
};

export async function mockNetworkValidationRequests(page: Page | BrowserContext) {
  await Promise.all([
    page.route('https://api.testnet.hiro.so/v2/info', route =>
      route.fulfill({ json: testnetChainInfo })
    ),
    page.route('**/leather.mempool.space/api/mempool/recent', route => route.fulfill({ json: [] })),
    page.route('**/mempool.space/testnet/api/mempool/recent', route => route.fulfill({ json: [] })),
  ]);
}
