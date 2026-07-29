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

test.describe('Bitcoin Staking', () => {
  test('users can start staking with the Special pool', async ({ page, mode }) => {
    await mode({ mode: 'mock-connected' });
    await setMockFlag(page, 'leather-mock-stx-balance', fundedBalanceMicroStx);

    // Let the connect-quest POST settle before a full-page navigation aborts it
    await page.waitForLoadState('networkidle');
    await page.goto('/staking');
    await page.getByTestId('start-staking-button-special').click();
    await page.locator('#amount').fill('500');
    await page.locator('#cycles').fill('12');
    await page.getByTestId('confirmation-terms-button').click();
    await page.getByTestId('confirmation-stake-button').click();
    await setMockFlag(page, 'leather-mock-pox5-staked', 'true');
    await page.getByRole('button', { name: 'Resolve' }).click();

    await page.waitForURL('**/staking/pool/special/active', { timeout: 15_000 });
    await test.expect(page.getByTestId('claimable-rewards-card')).toBeVisible({ timeout: 15_000 });
    await test.expect(page.getByTestId('unstake-button')).toBeVisible({ timeout: 15_000 });
    await test.expect(page.getByTestId('update-stake-button')).toBeVisible({ timeout: 15_000 });
  });

  test('already-staked users are redirected to their active position', async ({ page, mode }) => {
    await mode({ mode: 'mock-connected' });
    await setMockFlag(page, 'leather-mock-pox5-staked', 'true');

    await page.waitForLoadState('networkidle');
    await page.goto('/staking/pool/special');

    await page.waitForURL('**/staking/pool/special/active', { timeout: 15_000 });
    await test.expect(page.getByTestId('claimable-rewards-card')).toBeVisible();
  });

  test('the status page resolves to the pool the user is staking with', async ({ page, mode }) => {
    await mode({ mode: 'mock-connected' });
    await setMockFlag(page, 'leather-mock-pox5-staked', 'true');

    await page.waitForLoadState('networkidle');
    await page.goto('/staking/status');

    await page.waitForURL('**/staking/pool/special/active', { timeout: 15_000 });
    await test.expect(page.getByTestId('claimable-rewards-card')).toBeVisible({ timeout: 15_000 });
  });

  test('the status page falls back to the overview with no position', async ({ page, mode }) => {
    await mode({ mode: 'mock-connected' });

    await page.waitForLoadState('networkidle');
    await page.goto('/staking/status');

    await page.waitForURL(url => url.pathname === '/staking', { timeout: 15_000 });
    await test.expect(page.getByTestId('start-staking-button-special')).toBeVisible({
      timeout: 15_000,
    });
  });

  test('users can claim accrued sBTC rewards', async ({ page, mode }) => {
    await mode({ mode: 'mock-connected' });
    await setMockFlag(page, 'leather-mock-pox5-staked', 'true');

    // Approach via the pool page: a direct full-page load of /active renders
    // before the persisted connection hydrates and bounces to the landing.
    await page.waitForLoadState('networkidle');
    await page.goto('/staking/pool/special');
    await page.waitForURL('**/staking/pool/special/active', { timeout: 15_000 });

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
    await page.goto('/staking/pool/special');
    await page.locator('#amount').fill('500');
    await page.getByTestId('confirmation-terms-button').click();

    await test.expect(page.getByTestId('prepare-phase-callout')).toBeVisible();
    await test.expect(page.getByTestId('confirmation-stake-button')).toBeDisabled();
  });

  test('form validation blocks invalid amounts and durations', async ({ page, mode }) => {
    await mode({ mode: 'mock-connected' });
    await setMockFlag(page, 'leather-mock-stx-balance', fundedBalanceMicroStx);

    await page.waitForLoadState('networkidle');
    await page.goto('/staking/pool/special');

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
