import { Page, expect } from '@playwright/test';
import { AllBalancesSelectors } from '@tests/selectors/all-balances.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';

import { test } from '../../fixtures/fixtures';

async function navigateToAllBalances(page: Page) {
  await page.getByTestId(AllBalancesSelectors.AllBalancesMenuItem).click();
  await page.getByTestId(AllBalancesSelectors.AllBalancesPage).waitFor();
}

test.describe('All balances', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, settingsPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
    await settingsPage.openSettingsPage();
  });

  test('that all balances page shows total balance header and protocol totals', async ({
    page,
  }) => {
    await navigateToAllBalances(page);

    await expect(page.getByText('Total balance')).toBeVisible();
    await expect(page.getByText('$23,312.33')).toBeVisible();

    const btcSection = page.getByRole('button', { name: /Available to transfer/ }).locator('../..');
    await expect(btcSection).toContainText('Bitcoin protocol');
    await expect(btcSection).toContainText('$450');

    const stxSection = page
      .getByRole('button', { name: /STX available to transfer/ })
      .locator('../..');
    await expect(stxSection).toContainText('Stacks protocol');
  });

  test('that bitcoin protocol section displays correct balance values', async ({ page }) => {
    await navigateToAllBalances(page);

    const availableRow = page.getByTestId(AllBalancesSelectors.BalanceRowAvailable);
    await expect(availableRow).toBeVisible();
    await expect(availableRow).toContainText('$450.00');
    await expect(availableRow).toContainText('0.01');

    const unavailableRow = page.getByTestId(AllBalancesSelectors.BalanceRowUnavailable);
    await expect(unavailableRow).toBeVisible();
    await expect(unavailableRow).toContainText('$0.00');

    const pendingRow = page.getByTestId(AllBalancesSelectors.BalanceRowPending);
    await expect(pendingRow).toBeVisible();
    await expect(pendingRow).toContainText('$0.00');

    const runesRow = page.getByTestId(AllBalancesSelectors.BalanceRowRunes);
    await expect(runesRow).toBeVisible();
    await expect(runesRow).toContainText(/\d+ runes/);
  });

  test('that stacks protocol section displays correct balance values', async ({ page }) => {
    await navigateToAllBalances(page);

    const stxAvailableRow = page.getByRole('button', { name: /STX available to transfer/ });
    await expect(stxAvailableRow).toBeVisible();
    await expect(stxAvailableRow.getByText(/13\.568037/)).toBeVisible();

    const stxLockedRow = page.getByRole('button', { name: /STX locked/ });
    await expect(stxLockedRow).toBeVisible();
    await expect(stxLockedRow).toContainText('0');

    const stxPendingRow = page.getByRole('button', { name: /STX Pending/ });
    await expect(stxPendingRow).toBeVisible();
    await expect(stxPendingRow).toContainText('0');

    const sip10Row = page.getByRole('button', { name: /SIP 10/ });
    await expect(sip10Row).toBeVisible();
    await expect(sip10Row).toContainText(/\d+ tokens/);
  });

  test('that sBTC balance rows display values when sBTC is held', async ({ page }) => {
    await navigateToAllBalances(page);

    const sbtcAvailableRow = page.getByRole('button', { name: /sBTC available to transfer/ });
    await expect(sbtcAvailableRow).toBeVisible();
    await expect(sbtcAvailableRow).toContainText('0.5');

    await expect(page.getByText('sBTC locked')).toBeVisible();
    await expect(page.getByText('sBTC Pending')).toBeVisible();
  });

  test('that detail page shows UTXO content grouped by address', async ({ page }) => {
    await navigateToAllBalances(page);
    await page.getByTestId(AllBalancesSelectors.BalanceRowAvailable).click();

    await expect(page.getByTestId(AllBalancesSelectors.AllBalancesDetailPage)).toBeVisible();
    await expect(page.getByText('Available to transfer')).toBeVisible();
    await expect(page.getByText('$450.00')).toBeVisible();

    await expect(page.getByText(/across 1 address/)).toBeVisible();
    await expect(page.getByText('Taproot')).toBeVisible();
    await expect(page.getByText('UTXO #1')).toBeVisible();
    await expect(page.getByText(/50000 sats/)).toBeVisible();
  });

  test('that detail page back button returns to all balances list', async ({ page }) => {
    await navigateToAllBalances(page);
    await page.getByTestId(AllBalancesSelectors.BalanceRowAvailable).click();
    await page.getByTestId(AllBalancesSelectors.AllBalancesDetailPage).waitFor();

    await page.getByTestId(AllBalancesSelectors.DetailBackButton).click();

    await expect(page.getByTestId(AllBalancesSelectors.AllBalancesPage)).toBeVisible();
  });

  test('that all balances back button returns to settings', async ({ page }) => {
    await navigateToAllBalances(page);

    await page.getByTestId(AllBalancesSelectors.BackButton).click();

    await expect(page.getByTestId(SettingsSelectors.SettingsPage)).toBeVisible();
  });

  test('that each bitcoin category navigates to its detail page', async ({ page }) => {
    await navigateToAllBalances(page);

    const categories = [
      { selector: AllBalancesSelectors.BalanceRowAvailable, title: 'Available to transfer' },
      { selector: AllBalancesSelectors.BalanceRowUnavailable, title: 'Unavailable to transfer' },
      { selector: AllBalancesSelectors.BalanceRowPending, title: 'Pending' },
      { selector: AllBalancesSelectors.BalanceRowRunes, title: 'BTC in Runes' },
    ];

    for (const { selector, title } of categories) {
      await page.getByTestId(selector).click();

      await expect(page.getByTestId(AllBalancesSelectors.AllBalancesDetailPage)).toBeVisible();
      await expect(page.getByText(title)).toBeVisible();

      await page.getByTestId(AllBalancesSelectors.DetailBackButton).click();
      await page.getByTestId(AllBalancesSelectors.AllBalancesPage).waitFor();
    }
  });
});
