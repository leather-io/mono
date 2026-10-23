import type { BrowserContext, Page } from '@playwright/test';

const poxInfo = {
  contract_id: 'SP000000000000000000002Q6VF78.pox-4',
  first_burnchain_block_height: 666050,
  current_burnchain_block_height: 920000,
  prepare_phase_block_length: 100,
  reward_phase_block_length: 2000,
};

const emptyStakingBondsResponse = {
  limit: 200,
  total: 0,
  cursor: { next: null, previous: null, current: null },
  results: [],
};

export async function mockStacksStakingRequests(page: Page | BrowserContext) {
  await Promise.all([
    page.route('**hiro.so/v2/pox', route => route.fulfill({ json: poxInfo })),
    page.route('**hiro.so/extended/v3/staking/bonds**', route =>
      route.fulfill({ json: emptyStakingBondsResponse })
    ),
  ]);
}
