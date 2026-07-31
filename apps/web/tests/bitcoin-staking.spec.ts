import { Page } from '@playwright/test';

import { test } from './index';

// In mock mode the app runs its own in-page MSW worker, so per-test variants
// are driven through localStorage flags read by pox5-mock-overrides.ts rather
// than Playwright-level handler overrides (which those requests never reach).
async function setMockFlag(page: Page, key: string, value: string) {
  await page.evaluate(
    ([flagKey, flagValue]) => localStorage.setItem(flagKey, flagValue),
    [key, value]
  );
}

const fundedBalanceMicroStx = '1000000000000';

// Must match mockCustomSignerManagerContractId in
// app/mocks/api/hiro.so/pox5-custom-signer-manager.ts (kept as a literal here
// so the spec does not import app modules).
const customSignerManagerContractId =
  'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.byosm-custom-signer-manager';

const stackingDaoSignerManagerContractId =
  'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-pool-signer-manager';

test.describe('Bitcoin Staking', () => {
  test('users can start staking with the Stacking DAO pool', async ({ page, mode }) => {
    await mode({ mode: 'mock-connected' });
    await setMockFlag(page, 'leather-mock-stx-balance', fundedBalanceMicroStx);

    // Let the connect-quest POST settle before a full-page navigation aborts it
    await page.waitForLoadState('networkidle');
    await page.goto('/staking');
    await page.getByTestId('start-staking-button-stacking-dao').click();
    await page.locator('#amount').fill('500');
    await page.locator('#cycles').fill('12');
    await page.getByTestId('confirmation-terms-button').click();
    await page.getByTestId('confirmation-stake-button').click();
    await setMockFlag(page, 'leather-mock-pox5-staked', 'true');
    await page.getByRole('button', { name: 'Resolve' }).click();

    await page.waitForURL('**/staking/pool/stacking-dao/active', { timeout: 15_000 });
    await test.expect(page.getByTestId('claimable-rewards-card')).toBeVisible({ timeout: 15_000 });
    await test.expect(page.getByTestId('unstake-button')).toBeVisible({ timeout: 15_000 });
    await test.expect(page.getByTestId('update-stake-button')).toBeVisible({ timeout: 15_000 });
  });

  test('the confirming screen holds until the transaction confirms', async ({ page, mode }) => {
    await mode({ mode: 'mock-connected' });
    await setMockFlag(page, 'leather-mock-stx-balance', fundedBalanceMicroStx);
    await setMockFlag(page, 'leather-mock-pox5-tx-status', 'pending');

    await page.waitForLoadState('networkidle');
    await page.goto('/staking');
    await page.getByTestId('start-staking-button-stacking-dao').click();
    await page.locator('#amount').fill('500');
    await page.locator('#cycles').fill('12');
    await page.getByTestId('confirmation-terms-button').click();
    await page.getByTestId('confirmation-stake-button').click();
    await page.getByRole('button', { name: 'Resolve' }).click();

    await test.expect(page.getByTestId('pox5-tx-status-screen')).toBeVisible({ timeout: 15_000 });
    await test.expect(page).toHaveURL(/\/staking\/pool\/stacking-dao$/);

    await setMockFlag(page, 'leather-mock-pox5-staked', 'true');
    await setMockFlag(page, 'leather-mock-pox5-tx-status', 'success');

    await page.waitForURL('**/staking/pool/stacking-dao/active', { timeout: 30_000 });
    await test.expect(page.getByTestId('claimable-rewards-card')).toBeVisible({ timeout: 15_000 });
  });

  test('a failed transaction shows the failure state', async ({ page, mode }) => {
    await mode({ mode: 'mock-connected' });
    await setMockFlag(page, 'leather-mock-stx-balance', fundedBalanceMicroStx);
    await setMockFlag(page, 'leather-mock-pox5-tx-status', 'abort_by_post_condition');

    await page.waitForLoadState('networkidle');
    await page.goto('/staking/pool/stacking-dao');
    await page.locator('#amount').fill('500');
    await page.locator('#cycles').fill('12');
    await page.getByTestId('confirmation-terms-button').click();
    await page.getByTestId('confirmation-stake-button').click();
    await page.getByRole('button', { name: 'Resolve' }).click();

    await test.expect(page.getByTestId('pox5-tx-status-failed')).toBeVisible({ timeout: 15_000 });
    await page.getByTestId('pox5-tx-dismiss-button').click();
    await test.expect(page.locator('#amount')).toBeVisible();
  });

  test('rejecting in the wallet surfaces an error without navigating', async ({ page, mode }) => {
    await mode({ mode: 'mock-connected' });
    await setMockFlag(page, 'leather-mock-stx-balance', fundedBalanceMicroStx);

    await page.waitForLoadState('networkidle');
    await page.goto('/staking/pool/stacking-dao');
    await page.locator('#amount').fill('500');
    await page.locator('#cycles').fill('12');
    await page.getByTestId('confirmation-terms-button').click();
    await page.getByTestId('confirmation-stake-button').click();
    await page.getByRole('button', { name: 'Reject' }).click();

    await test
      .expect(page.getByTestId('pox5-submit-error').first())
      .toBeVisible({ timeout: 15_000 });
    await test.expect(page).toHaveURL(/\/staking\/pool\/stacking-dao$/);
  });

  test('already-staked users are redirected to their active position', async ({ page, mode }) => {
    await mode({ mode: 'mock-connected' });
    await setMockFlag(page, 'leather-mock-pox5-staked', 'true');

    await page.waitForLoadState('networkidle');
    await page.goto('/staking/pool/stacking-dao');

    await page.waitForURL('**/staking/pool/stacking-dao/active', { timeout: 15_000 });
    await test.expect(page.getByTestId('claimable-rewards-card')).toBeVisible();
    await test
      .expect(page.getByTestId('active-pool-tvl'))
      .toHaveText('1,050,000 STX', { timeout: 15_000 });
    await test.expect(page.getByTestId('active-pool-tvl-usd')).toHaveText('$843,380.30');
  });

  test('the status page resolves to the pool the user is staking with', async ({ page, mode }) => {
    await mode({ mode: 'mock-connected' });
    await setMockFlag(page, 'leather-mock-pox5-staked', 'true');

    await page.waitForLoadState('networkidle');
    await page.goto('/staking/status');

    await page.waitForURL('**/staking/pool/stacking-dao/active', { timeout: 15_000 });
    await test.expect(page.getByTestId('claimable-rewards-card')).toBeVisible({ timeout: 15_000 });
  });

  test('the status page falls back to the overview with no position', async ({ page, mode }) => {
    await mode({ mode: 'mock-connected' });

    await page.waitForLoadState('networkidle');
    await page.goto('/staking/status');

    await page.waitForURL(url => url.pathname === '/staking', { timeout: 15_000 });
    await test.expect(page.getByTestId('start-staking-button-stacking-dao')).toBeVisible({
      timeout: 15_000,
    });
  });

  test('users can claim accrued sBTC rewards', async ({ page, mode }) => {
    await mode({ mode: 'mock-connected' });
    await setMockFlag(page, 'leather-mock-pox5-staked', 'true');

    // Approach via the pool page: a direct full-page load of /active renders
    // before the persisted connection hydrates and bounces to the landing.
    await page.waitForLoadState('networkidle');
    await page.goto('/staking/pool/stacking-dao');
    await page.waitForURL('**/staking/pool/stacking-dao/active', { timeout: 15_000 });

    const claimButton = page.getByTestId('claim-rewards-button');
    await test.expect(claimButton).toBeEnabled({ timeout: 15_000 });
    await claimButton.click();
    await page.getByRole('button', { name: 'Resolve' }).click();
  });

  test('staking is blocked during the prepare phase', async ({ page, mode }) => {
    await mode({ mode: 'mock-connected' });
    await setMockFlag(page, 'leather-mock-stx-balance', fundedBalanceMicroStx);
    await setMockFlag(page, 'leather-mock-burn-height', '907460');

    await page.waitForLoadState('networkidle');
    await page.goto('/staking/pool/stacking-dao');
    await page.locator('#amount').fill('500');
    await page.getByTestId('confirmation-terms-button').click();

    await test.expect(page.getByTestId('prepare-phase-callout')).toBeVisible();
    await test.expect(page.getByTestId('confirmation-stake-button')).toBeDisabled();
  });

  test('users can stake with a custom signer manager', async ({ page, mode }) => {
    await mode({ mode: 'mock-connected' });
    await setMockFlag(page, 'leather-mock-stx-balance', fundedBalanceMicroStx);

    await page.waitForLoadState('networkidle');
    await page.goto('/staking');
    await page.getByTestId('byosm-entry-link').click();
    await page.getByTestId('byosm-contract-input').fill(customSignerManagerContractId);
    await page.getByTestId('byosm-contract-continue').click();

    await test.expect(page).toHaveURL(/\/staking\/pool\/byosm\?contract=/, { timeout: 15_000 });
    await test.expect(page.locator('#amount')).toBeVisible({ timeout: 15_000 });

    await page.locator('#amount').fill('500');
    await page.locator('#cycles').fill('12');
    await page.getByTestId('confirmation-terms-button').click();
    await page.getByTestId('confirmation-stake-button').click();
    await setMockFlag(page, 'leather-mock-pox5-staked-custom', 'true');
    await page.getByRole('button', { name: 'Resolve' }).click();

    await page.waitForURL('**/staking/pool/byosm/active**', { timeout: 15_000 });
    await test.expect(page.getByTestId('claimable-rewards-card')).toBeVisible({ timeout: 15_000 });
    await test.expect(page.getByTestId('unstake-button')).toBeVisible({ timeout: 15_000 });
    await test.expect(page.getByTestId('update-stake-button')).toBeVisible({ timeout: 15_000 });
  });

  test('an unlisted position links to the byosm active page', async ({ page, mode }) => {
    await mode({ mode: 'mock-connected' });
    await setMockFlag(page, 'leather-mock-pox5-staked-custom', 'true');

    await page.waitForLoadState('networkidle');
    await page.goto('/staking');
    await page.getByTestId('staking-user-position').getByText('View position').click();

    await page.waitForURL('**/staking/pool/byosm/active**', { timeout: 15_000 });
    await test.expect(page.getByTestId('claimable-rewards-card')).toBeVisible({ timeout: 15_000 });
    await test.expect(page.getByTestId('unstake-button')).toBeVisible({ timeout: 15_000 });
  });

  test('the status page resolves an unlisted position to the byosm active page', async ({
    page,
    mode,
  }) => {
    await mode({ mode: 'mock-connected' });
    await setMockFlag(page, 'leather-mock-pox5-staked-custom', 'true');

    await page.waitForLoadState('networkidle');
    await page.goto('/staking/status');

    await page.waitForURL('**/staking/pool/byosm/active**', { timeout: 15_000 });
    await test.expect(page.getByTestId('claimable-rewards-card')).toBeVisible({ timeout: 15_000 });
  });

  test('the byosm entry form rejects malformed contract principals', async ({ page, mode }) => {
    await mode({ mode: 'mock-connected' });

    await page.waitForLoadState('networkidle');
    await page.goto('/staking/pool/byosm');
    await page.getByTestId('byosm-contract-input').fill('not-a-contract');
    await page.getByTestId('byosm-contract-continue').click();

    await test
      .expect(page.getByText('Enter a contract principal in address.contract-name format.'))
      .toBeVisible();
    await test.expect(page).toHaveURL(/\/staking\/pool\/byosm$/);
  });

  test('the byosm entry form redirects a listed signer manager to its pool page', async ({
    page,
    mode,
  }) => {
    await mode({ mode: 'mock-connected' });

    await page.waitForLoadState('networkidle');
    await page.goto('/staking/pool/byosm');
    await page.getByTestId('byosm-contract-input').fill(stackingDaoSignerManagerContractId);
    await page.getByTestId('byosm-contract-continue').click();

    await page.waitForURL('**/staking/pool/stacking-dao', { timeout: 15_000 });
  });

  test('a byosm deep link with a listed signer manager redirects to its pool page', async ({
    page,
    mode,
  }) => {
    await mode({ mode: 'mock-connected' });

    await page.waitForLoadState('networkidle');
    await page.goto(`/staking/pool/byosm?contract=${stackingDaoSignerManagerContractId}`);

    await page.waitForURL('**/staking/pool/stacking-dao', { timeout: 15_000 });
  });

  test('the pool overview sums total staked across signer managers and warns when low', async ({
    page,
    mode,
  }) => {
    await mode({ mode: 'mock-connected' });
    await setMockFlag(page, 'leather-mock-stx-balance', fundedBalanceMicroStx);

    await page.waitForLoadState('networkidle');
    await page.goto('/staking');
    await test
      .expect(page.getByTestId('pool-tvl-xverse-pool'))
      .toHaveText('225,000 STX', { timeout: 15_000 });
    await test.expect(page.getByTestId('pool-tvl-xverse-pool-usd')).toHaveText('$180,724.35');
    await test.expect(page.getByTestId('pool-tvl-fast-pool')).toHaveText('150,000 STX');
    await test.expect(page.getByTestId('pool-tvl-stacking-dao')).toHaveText('1,050,000 STX');

    // Xverse has three signer-manager contracts; the mock answers 75k STX for
    // each, so the overview must show the 225k sum.
    await page.goto('/staking/pool/xverse-pool');
    await test
      .expect(page.getByTestId('pool-total-staked'))
      .toHaveText('225,000 STX', { timeout: 15_000 });
    await test.expect(page.getByTestId('pool-health-warning')).toHaveCount(0);

    await setMockFlag(page, 'leather-mock-pox5-delegated-low', 'true');
    await page.goto('/staking/pool/xverse-pool');
    await test
      .expect(page.getByTestId('pool-total-staked'))
      .toHaveText('30,000 STX', { timeout: 15_000 });
    await test.expect(page.getByTestId('pool-health-warning')).toBeVisible({ timeout: 15_000 });
  });

  test('form validation blocks invalid amounts and durations', async ({ page, mode }) => {
    await mode({ mode: 'mock-connected' });
    await setMockFlag(page, 'leather-mock-stx-balance', fundedBalanceMicroStx);

    await page.waitForLoadState('networkidle');
    await page.goto('/staking/pool/stacking-dao');

    await page.locator('#amount').fill('2000000');
    await page.locator('#amount').blur();
    await test
      .expect(page.getByText('You cannot stake more than your available balance'))
      .toBeVisible();

    await page.locator('#amount').fill('0');
    await page.locator('#amount').blur();
    await test.expect(page.getByText('You must stack an amount')).toBeVisible();

    await page.locator('#cycles').fill('97');
    await page.locator('#cycles').blur();
    await test.expect(page.getByText('Choose between 1 and 96 cycles')).toBeVisible();
  });
});
