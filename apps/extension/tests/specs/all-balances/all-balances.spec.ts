import { Page, expect } from '@playwright/test';
import { AllBalancesSelectors } from '@tests/selectors/all-balances.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import { test } from '../../fixtures/fixtures';

async function navigateToAllBalances(page: Page) {
  await page.getByTestId(AllBalancesSelectors.AllBalancesMenuItem).click();
  await page.getByTestId(AllBalancesSelectors.AllBalancesPage).waitFor();
}

async function goBack(page: Page) {
  await page.getByTestId(SharedComponentsSelectors.HeaderBackBtn).click();
}

test.describe('All balances', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, settingsPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
    await settingsPage.openSettingsPage();
  });

  test('that the settings menu opens the all balances page', async ({ page }) => {
    await expect(page.getByTestId(AllBalancesSelectors.AllBalancesMenuItem)).toBeVisible();

    await navigateToAllBalances(page);

    await expect(page.getByTestId(AllBalancesSelectors.TotalBalance)).toContainText(
      'Total balance'
    );
  });

  test('that the total balance sums both protocols', async ({ page }) => {
    await navigateToAllBalances(page);

    await expect(page.getByTestId(AllBalancesSelectors.TotalBalance)).toContainText('$23,312.33');
  });

  test('that the bitcoin protocol section displays its balance buckets', async ({ page }) => {
    await navigateToAllBalances(page);

    const btcSection = page.getByTestId(AllBalancesSelectors.BitcoinProtocolSection);
    await expect(btcSection).toContainText('Bitcoin protocol');
    await expect(btcSection).toContainText('$450.00');
    await expect(btcSection).toContainText('0.01');

    const availableRow = page.getByTestId(AllBalancesSelectors.BalanceRowAvailable);
    await expect(availableRow).toContainText('Available to transfer');
    await expect(availableRow).toContainText('$450.00');
    await expect(availableRow).toContainText('0.01');

    await expect(page.getByTestId(AllBalancesSelectors.BalanceRowPending)).toContainText('$0.00');
    await expect(page.getByTestId(AllBalancesSelectors.BalanceRowSending)).toContainText('$0.00');
    await expect(page.getByTestId(AllBalancesSelectors.BalanceRowUneconomical)).toContainText(
      '$0.00'
    );
  });

  test('that the stacks protocol section displays stx, sip-10 and sbtc balances', async ({
    page,
  }) => {
    await navigateToAllBalances(page);

    const stxAvailableRow = page.getByTestId(AllBalancesSelectors.BalanceRowStxAvailable);
    await expect(stxAvailableRow).toContainText('STX available to transfer');
    await expect(stxAvailableRow).toContainText('13.568037');

    await expect(page.getByTestId(AllBalancesSelectors.BalanceRowStxLocked)).toContainText('$0.00');
    await expect(page.getByTestId(AllBalancesSelectors.BalanceRowStxPending)).toContainText(
      '$0.00'
    );

    await expect(page.getByTestId(AllBalancesSelectors.BalanceRowSip10)).toContainText('$350.80');

    const sbtcRow = page.getByTestId(AllBalancesSelectors.BalanceRowSbtc);
    await expect(sbtcRow).toContainText('$22,500.00');
    await expect(sbtcRow).toContainText('0.5');
  });

  test('that the available detail page groups utxos by address', async ({ page }) => {
    await navigateToAllBalances(page);
    await page.getByTestId(AllBalancesSelectors.BalanceRowAvailable).click();

    await expect(page.getByTestId(AllBalancesSelectors.AllBalancesDetailPage)).toBeVisible();

    const total = page.getByTestId(AllBalancesSelectors.DetailTotal);
    await expect(total).toContainText('Available to transfer');
    await expect(total).toContainText('$450.00');
    await expect(total).toContainText('across 2 addresses');

    const addressGroups = page.getByTestId(AllBalancesSelectors.DetailAddressGroup);
    await expect(addressGroups).toHaveCount(2);
    await expect(addressGroups.first()).toContainText('Taproot');
    await expect(addressGroups.first()).toContainText('$270.00');
    await expect(addressGroups.last()).toContainText('Native Segwit');
    await expect(addressGroups.last()).toContainText('$180.00');

    await expect(page.getByTestId(AllBalancesSelectors.DetailUtxoRow)).toHaveCount(4);
  });

  test('that empty categories show an empty state', async ({ page }) => {
    await navigateToAllBalances(page);
    await page.getByTestId(AllBalancesSelectors.BalanceRowPending).click();

    await expect(page.getByTestId(AllBalancesSelectors.DetailEmpty)).toBeVisible();
    await expect(page.getByTestId(AllBalancesSelectors.DetailTotal)).toContainText(
      'across 0 addresses'
    );
  });

  test('that each bitcoin category navigates to its detail page', async ({ page }) => {
    await navigateToAllBalances(page);

    const categories = [
      { selector: AllBalancesSelectors.BalanceRowAvailable, title: 'Available to transfer' },
      { selector: AllBalancesSelectors.BalanceRowPending, title: 'Pending' },
      { selector: AllBalancesSelectors.BalanceRowSending, title: 'Sending' },
      { selector: AllBalancesSelectors.BalanceRowUneconomical, title: 'Uneconomical' },
    ];

    for (const { selector, title } of categories) {
      await page.getByTestId(selector).click();

      await expect(page.getByTestId(AllBalancesSelectors.AllBalancesDetailPage)).toBeVisible();
      await expect(page.getByTestId(AllBalancesSelectors.DetailTotal)).toContainText(title);

      await goBack(page);
      await page.getByTestId(AllBalancesSelectors.AllBalancesPage).waitFor();
    }
  });

  test('that an unknown category redirects to the all balances page', async ({
    extensionId,
    page,
  }) => {
    await page.goto(`chrome-extension://${extensionId}/index.html#/all-balances/bogus`);

    await expect(page.getByTestId(AllBalancesSelectors.AllBalancesPage)).toBeVisible();
  });

  test('that the back button returns to settings', async ({ page }) => {
    await navigateToAllBalances(page);

    await goBack(page);

    await expect(page.getByTestId(SettingsSelectors.SettingsPage)).toBeVisible();
  });

  test('that private mode hides every balance', async ({ page, settingsPage }) => {
    await goBack(page);
    await settingsPage.openSettingsMenu();
    await page.getByTestId(SettingsSelectors.TogglePrivacy).click();
    await page.getByTestId(SettingsSelectors.SettingsMenuItem).click();
    await page.getByTestId(SettingsSelectors.SettingsPage).waitFor();

    await navigateToAllBalances(page);

    await expect(page.getByTestId(AllBalancesSelectors.TotalBalance)).toContainText('***');
    await expect(page.getByTestId(AllBalancesSelectors.BalanceRowAvailable)).toContainText('***');
    await expect(page.getByTestId(AllBalancesSelectors.BalanceRowSbtc)).toContainText('***');

    await page.getByTestId(AllBalancesSelectors.BalanceRowAvailable).click();

    await expect(page.getByTestId(AllBalancesSelectors.DetailTotal)).toContainText('***');
    await expect(page.getByTestId(AllBalancesSelectors.DetailUtxoRow).first()).toContainText('***');
  });
});
