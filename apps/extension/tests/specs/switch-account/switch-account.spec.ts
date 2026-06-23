import { expect } from '@playwright/test';
import { mockBnsV2NamesRequestEmpty } from '@tests/mocks/mock-stacks-bns';

import { test } from '../../fixtures/fixtures';

test.describe('Switch account sheet', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    // Keep account names deterministic ("Account N") by resolving no BNS names
    await mockBnsV2NamesRequestEmpty(page);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('that it lists the accounts of the wallet', async ({ switchAccountPage }) => {
    await switchAccountPage.open();

    await expect(switchAccountPage.selectAccountHeader).toBeVisible();
    await expect(switchAccountPage.accountName(0)).toHaveText('Account 1');
    await expect(switchAccountPage.accountName(1)).toHaveText('Account 2');
  });

  test('that selecting a different account switches the active account', async ({
    switchAccountPage,
  }) => {
    await switchAccountPage.open();
    await switchAccountPage.selectAccount(1);

    await expect(switchAccountPage.currentAccountName).toHaveText('Account 2');
  });

  test('that the add wallet sheet presents wallet creation options', async ({
    switchAccountPage,
    page,
  }) => {
    await switchAccountPage.open();
    await switchAccountPage.openAddWalletMenu();

    await expect(page.getByText('Create new wallet')).toBeVisible();
    await expect(page.getByText('Restore wallet')).toBeVisible();
    await expect(page.getByText('Connect hardware wallet')).toBeVisible();
  });

  test('that choosing create new wallet opens the create wallet flow', async ({
    switchAccountPage,
    page,
  }) => {
    await switchAccountPage.open();
    await switchAccountPage.createNewWallet();

    await page.waitForURL('**/create-wallet');
    await expect(page.getByText('Back up your Secret Key')).toBeVisible();
  });

  test('that rapidly double-clicking add account creates only one account', async ({
    switchAccountPage,
  }) => {
    await switchAccountPage.open();

    const activeAccount = await switchAccountPage.getActiveAccount();
    if (!activeAccount) throw new Error('Expected an active account before adding one');
    const { fingerprint } = activeAccount;
    const before = await switchAccountPage.getHighestAccountIndex(fingerprint);

    await switchAccountPage.addAccountButton.first().dblclick();
    await switchAccountPage.selectAccountHeader.waitFor({ state: 'hidden' });

    await expect
      .poll(async () => switchAccountPage.getHighestAccountIndex(fingerprint), { timeout: 5000 })
      .toBe(before + 1);

    await switchAccountPage.page.waitForTimeout(1000);
    expect(await switchAccountPage.getHighestAccountIndex(fingerprint)).toBe(before + 1);
  });

  test('that manage mode can be toggled on and off', async ({ switchAccountPage, page }) => {
    await switchAccountPage.open();
    await switchAccountPage.enterManageMode();

    await expect(switchAccountPage.manageWalletsHeader).toBeVisible();

    await page.getByRole('button', { name: 'Done' }).click();
    await expect(switchAccountPage.selectAccountHeader).toBeVisible();
  });

  test('that account rows cannot be activated by keyboard in manage mode', async ({
    switchAccountPage,
  }) => {
    await switchAccountPage.open();
    const before = await switchAccountPage.getActiveAccount();

    await switchAccountPage.enterManageMode();

    const row = switchAccountPage.accountRow(1);
    await expect(row).toBeDisabled();

    await row.focus();
    await switchAccountPage.page.keyboard.press('Enter');

    await expect(switchAccountPage.manageWalletsHeader).toBeVisible();
    expect(await switchAccountPage.getActiveAccount()).toEqual(before);
  });
});
