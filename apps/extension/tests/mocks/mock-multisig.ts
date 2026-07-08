import { BrowserContext, Page } from '@playwright/test';

// Only `id` is load-bearing for the dApp result (it becomes `proposalId`).
export const exampleMultisigTransactionId = 'multisig-tx-e2e-123';

export function makeMultisigTransaction(overrides: Record<string, unknown> = {}) {
  return {
    id: exampleMultisigTransactionId,
    status: 'pending',
    signatures: [],
    ...overrides,
  };
}

// Routes the JWT-less propose endpoint. Register on the CONTEXT in beforeEach so
// the full-page approval popup (opened in test env) inherits it. The glob is
// host-agnostic so it matches whichever Leather API base url the build resolves.
export async function mockProposeMultisigTransaction(
  target: Page | BrowserContext,
  tx = makeMultisigTransaction()
) {
  await target.route('**/v1/multisig-ext/propose', route => route.fulfill({ json: tx }));
}

// Funds a Stacks multisig address so the propose approval (and in-app send form)
// pass the available-balance check. Registered after the default mocks so the
// address-specific route takes precedence over the wildcard.
export async function mockFundedStacksAddress(target: Page | BrowserContext, address: string) {
  await target.route(`**hiro.so/extended/v2/addresses/${address}/balances/stx`, route =>
    route.fulfill({
      json: {
        balance: '100000000',
        total_miner_rewards_received: '0',
        lock_tx_id: '',
        locked: '0',
        lock_height: 0,
        burnchain_lock_height: 0,
        burnchain_unlock_height: 0,
      },
    })
  );
}

export async function mockUnfundedStacksAddress(target: Page | BrowserContext, address: string) {
  await target.route(`**hiro.so/extended/v2/addresses/${address}/balances/stx`, route =>
    route.fulfill({
      json: {
        balance: '0',
        total_miner_rewards_received: '0',
        lock_tx_id: '',
        locked: '0',
        lock_height: 0,
        burnchain_lock_height: 0,
        burnchain_unlock_height: 0,
      },
    })
  );
}
