import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import { test } from '../../fixtures/fixtures';

test.describe('Account Card (extensionRevamp)', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('that account card displays total balance label', async ({ page }) => {
    const balanceLabel = page.getByText('Total balance');
    await test.expect(balanceLabel).toBeVisible();
  });

  test('that account card displays balance amount', async ({ page }) => {
    const balanceText = page.getByTestId(SharedComponentsSelectors.AccountCardBalanceText);
    await test.expect(balanceText).toBeVisible();
    const balance = await balanceText.innerText();
    test.expect(balance).toBeTruthy();
  });

  test('that network switcher badge is visible when enabled', async ({ page }) => {
    const networkBadge = page.getByTestId('network-switcher-badge');
    await test.expect(networkBadge).toBeVisible();
  });

  test('that clicking network badge opens network selection', async ({ page }) => {
    const networkBadge = page.getByTestId('network-switcher-badge');
    await networkBadge.click();

    await test.expect(page).toHaveURL(/.*network/);
  });

  test('that account name is displayed in header', async ({ page }) => {
    const accountSelector = page.getByTestId('header-account-selector');
    await test.expect(accountSelector).toBeVisible();
    const accountName = await accountSelector.innerText();
    test.expect(accountName).toContain('Account');
  });

  test('that clicking account selector opens account list', async ({ page }) => {
    const accountSelector = page.getByTestId('header-account-selector');
    await accountSelector.click();

    const accountList = page.getByTestId('account-list');
    await test.expect(accountList).toBeVisible();
  });
});
