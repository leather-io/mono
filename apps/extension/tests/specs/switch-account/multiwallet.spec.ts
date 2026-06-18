import { expect } from '@playwright/test';
import { STANDARD_BIP_FAKE_MNEMONIC, TEST_PASSWORD } from '@tests/mocks/constants';
import { mockBnsV2NamesRequestEmpty } from '@tests/mocks/mock-stacks-bns';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { SwitchAccountSelectors } from '@tests/selectors/switch-account.selectors';

import { test } from '../../fixtures/fixtures';

test.describe('Multiwallet management', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    // Keep account names deterministic ("Account N") by resolving no BNS names
    await mockBnsV2NamesRequestEmpty(page);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('that a user can create and add a new wallet', async ({ switchAccountPage }) => {
    test.slow();
    expect(await switchAccountPage.getWalletCount()).toBe(1);

    await switchAccountPage.open();
    await switchAccountPage.addNewWallet(TEST_PASSWORD);

    await expect.poll(() => switchAccountPage.getWalletCount()).toBe(2);
  });

  test('that a user can add multiple wallets', async ({ switchAccountPage }) => {
    test.slow();
    await switchAccountPage.open();
    await switchAccountPage.addNewWallet(TEST_PASSWORD);

    await switchAccountPage.open();
    await switchAccountPage.addNewWallet(TEST_PASSWORD);

    await expect.poll(() => switchAccountPage.getWalletCount()).toBe(3);
  });

  test('that a user can restore a wallet from a secret key', async ({ switchAccountPage }) => {
    test.slow();
    await switchAccountPage.open();
    await switchAccountPage.restoreWallet(STANDARD_BIP_FAKE_MNEMONIC, TEST_PASSWORD);

    await expect.poll(() => switchAccountPage.getWalletCount()).toBe(2);
  });

  test('that a user can hide and show an account', async ({ switchAccountPage }) => {
    await switchAccountPage.open();
    await switchAccountPage.enterManageMode();
    await switchAccountPage.hideAccount(1);
    await switchAccountPage.exitManageMode();

    await expect(switchAccountPage.accountName(1)).toHaveCount(0);
    await expect(switchAccountPage.accountName(0)).toBeVisible();

    await switchAccountPage.enterManageMode();
    await switchAccountPage.showAccount(1);
    await switchAccountPage.exitManageMode();

    await expect(switchAccountPage.accountName(1)).toBeVisible();
  });

  test('that the active account cannot be hidden', async ({ switchAccountPage, page }) => {
    await switchAccountPage.open();
    await switchAccountPage.enterManageMode();

    await switchAccountPage.openAccountMenu(0);
    await expect(page.getByRole('menuitem', { name: 'Rename' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Hide' })).toHaveCount(0);
    await page.keyboard.press('Escape');

    await switchAccountPage.openAccountMenu(1);
    await expect(page.getByRole('menuitem', { name: 'Hide' })).toBeVisible();
  });

  test('that a user can add an account to a wallet', async ({ switchAccountPage }) => {
    test.slow();
    await switchAccountPage.open();
    await expect(switchAccountPage.accountName(3)).toHaveCount(0);

    await switchAccountPage.addAccount(0);

    await switchAccountPage.open();
    await expect(switchAccountPage.accountName(3)).toHaveText('Account 4');
  });

  test('that a user can view a wallet secret key', async ({ switchAccountPage, page }) => {
    await switchAccountPage.open();
    await switchAccountPage.enterManageMode();
    await switchAccountPage.viewSecretKey(0);

    await page.getByTestId(SettingsSelectors.EnterPasswordInput).fill(TEST_PASSWORD);
    await page.getByTestId(SettingsSelectors.UnlockWalletBtn).click();
    await page.getByTestId(SettingsSelectors.ShowSecretKeyBtn).click();

    await expect(page.getByText('approve')).toBeVisible();
  });

  test('that a user can rename an account', async ({ switchAccountPage }) => {
    await switchAccountPage.open();
    await switchAccountPage.enterManageMode();
    await switchAccountPage.renameAccount('My main account', 0);

    await expect(switchAccountPage.accountName(0)).toHaveText('My main account');
  });

  test('that a user can rename a wallet', async ({ switchAccountPage }) => {
    await switchAccountPage.open();
    await switchAccountPage.enterManageMode();
    await switchAccountPage.renameWallet('Trading wallet', 0);

    await expect(switchAccountPage.walletHeaderNames.first()).toHaveText('Trading wallet');
  });

  test('that the rename account dialog prefills the current account name', async ({
    switchAccountPage,
    page,
  }) => {
    await switchAccountPage.open();
    await switchAccountPage.enterManageMode();
    await switchAccountPage.openAccountMenu(1);
    await switchAccountPage.clickMenuItem('Rename');

    await expect(page.getByTestId(SwitchAccountSelectors.RenameAccountInput)).toHaveValue(
      'Account 2'
    );
  });

  test('that the rename account dialog prefills a previously set custom name', async ({
    switchAccountPage,
    page,
  }) => {
    await switchAccountPage.open();
    await switchAccountPage.enterManageMode();
    await switchAccountPage.renameAccount('My main account', 0);

    await switchAccountPage.openAccountMenu(0);
    await switchAccountPage.clickMenuItem('Rename');

    await expect(page.getByTestId(SwitchAccountSelectors.RenameAccountInput)).toHaveValue(
      'My main account'
    );
  });
});
