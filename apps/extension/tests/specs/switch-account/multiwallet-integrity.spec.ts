import { expect } from '@playwright/test';
import { TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS, TEST_PASSWORD } from '@tests/mocks/constants';
import { mockBnsV2NamesRequestEmpty } from '@tests/mocks/mock-stacks-bns';
import {
  TEST_ACCOUNT_SECRET_KEY,
  makeLedgerTestAccountWalletState,
  testFingerprint,
} from '@tests/page-object-models/onboarding.page';
import { AccountSelectors } from '@tests/selectors/account.selectors';
import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { SwitchAccountSelectors } from '@tests/selectors/switch-account.selectors';

import { test } from '../../fixtures/fixtures';

test.describe('Multiwallet integrity', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    // Keep account names deterministic ("Account N") by resolving no BNS names
    await mockBnsV2NamesRequestEmpty(page);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('that removing the active wallet reassigns the active account', async ({
    switchAccountPage,
  }) => {
    test.slow();
    await switchAccountPage.open();
    await switchAccountPage.addNewWallet(TEST_PASSWORD);

    const activeBefore = await switchAccountPage.getActiveAccount();
    expect(activeBefore?.fingerprint).not.toBe(testFingerprint);

    await switchAccountPage.open();
    await switchAccountPage.enterManageMode();
    await switchAccountPage.removeWallet(1);

    await expect
      .poll(async () => (await switchAccountPage.getActiveAccount())?.fingerprint)
      .toBe(testFingerprint);
    const activeAfter = await switchAccountPage.getActiveAccount();
    expect(activeAfter?.accountIndex).toBe(0);
    expect(await switchAccountPage.getWalletCount()).toBe(1);
  });

  test('that the last remaining wallet cannot be removed', async ({ switchAccountPage, page }) => {
    await switchAccountPage.open();
    await switchAccountPage.enterManageMode();
    await switchAccountPage.openWalletMenu(0);

    await expect(page.getByRole('menuitem', { name: 'Rename' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Remove wallet' })).toHaveCount(0);
  });

  test('that custom names and hidden accounts survive a lock and unlock', async ({
    switchAccountPage,
    homePage,
    page,
  }) => {
    test.slow();
    await switchAccountPage.open();
    await switchAccountPage.enterManageMode();
    await switchAccountPage.renameAccount('Persisted name', 0);
    await switchAccountPage.hideAccount(1);
    await switchAccountPage.exitManageMode();
    await switchAccountPage.close();

    await homePage.lock();
    await page.getByTestId(SettingsSelectors.EnterPasswordInput).fill(TEST_PASSWORD);
    await page.getByTestId(SettingsSelectors.UnlockWalletBtn).click();
    await homePage.waitForHomePageReady();

    await switchAccountPage.open();
    await expect(switchAccountPage.accountName(0)).toHaveText('Persisted name');
    await expect(switchAccountPage.accountName(1)).toHaveCount(0);
  });

  test('that restoring an already-added wallet is rejected', async ({
    switchAccountPage,
    page,
  }) => {
    await switchAccountPage.open();
    await switchAccountPage.openAddWalletSheet();
    await page.getByText('Restore wallet').click();

    const words = TEST_ACCOUNT_SECRET_KEY.split(' ');
    for (let i = 0; i < words.length; i++) {
      await page.getByTestId(`mnemonic-input-${i + 1}`).fill(words[i]);
    }
    await page.getByTestId(OnboardingSelectors.SignInBtn).click();

    await expect(page.getByTestId(OnboardingSelectors.SignInSeedError)).toContainText(
      'already been added'
    );
    expect(await switchAccountPage.getWalletCount()).toBe(1);
  });

  test('that adding a wallet with the wrong password is rejected', async ({
    switchAccountPage,
    page,
  }) => {
    test.slow();
    await switchAccountPage.open();
    await switchAccountPage.createNewWallet();
    await page.getByTestId(OnboardingSelectors.BackUpSecretKeyBtn).click();
    await page.getByTestId(OnboardingSelectors.NewPasswordInput).fill('the-wrong-password');
    await page.getByTestId(OnboardingSelectors.SetPasswordBtn).click();

    await expect(page.getByText("The password you entered doesn't match")).toBeVisible();
    expect(await switchAccountPage.getWalletCount()).toBe(1);
  });

  test('that switching account changes the receive address', async ({
    switchAccountPage,
    homePage,
    page,
  }) => {
    const firstAccountAddress = await homePage.getReceiveNativeSegwitAddress();
    expect(firstAccountAddress).toBe(TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS);

    await page.keyboard.press('Escape');
    await homePage.waitForHomePageReady();

    await switchAccountPage.open();
    await switchAccountPage.selectAccount(1);

    const secondAccountAddress = await homePage.getReceiveNativeSegwitAddress();
    expect(secondAccountAddress).not.toBe(firstAccountAddress);
  });

  test('that renaming an account updates the home header', async ({ switchAccountPage, page }) => {
    await switchAccountPage.open();
    await switchAccountPage.enterManageMode();
    await switchAccountPage.renameAccount('Renamed home account', 0);
    await switchAccountPage.exitManageMode();
    await switchAccountPage.close();

    await expect(page.getByTestId(SettingsSelectors.CurrentAccountDisplayName)).toHaveText(
      'Renamed home account'
    );
  });

  test("that viewing a non-active wallet's secret key shows that wallet's key", async ({
    switchAccountPage,
    page,
  }) => {
    test.slow();
    await switchAccountPage.open();
    await switchAccountPage.addNewWallet(TEST_PASSWORD);

    const active = await switchAccountPage.getActiveAccount();
    expect(active?.fingerprint).not.toBe(testFingerprint);

    await switchAccountPage.open();
    await switchAccountPage.enterManageMode();
    await switchAccountPage.viewSecretKey(0);

    await page.getByTestId(SettingsSelectors.EnterPasswordInput).fill(TEST_PASSWORD);
    await page.getByTestId(SettingsSelectors.UnlockWalletBtn).click();
    await page.getByTestId(SettingsSelectors.ShowSecretKeyBtn).click();

    const words = TEST_ACCOUNT_SECRET_KEY.split(' ');
    await expect(page.getByText(words[0], { exact: true })).toBeVisible();
    await expect(page.getByText(words[5], { exact: true })).toBeVisible();
  });

  test('that cancelling wallet removal keeps the wallet', async ({ switchAccountPage, page }) => {
    test.slow();
    await switchAccountPage.open();
    await switchAccountPage.addNewWallet(TEST_PASSWORD);

    await switchAccountPage.open();
    await switchAccountPage.enterManageMode();
    await switchAccountPage.openWalletMenu(0);
    await switchAccountPage.clickMenuItem('Remove wallet');
    await page.getByRole('button', { name: 'Cancel' }).click();

    expect(await switchAccountPage.getWalletCount()).toBe(2);
    await expect(switchAccountPage.walletHeaderNames).toHaveCount(2);
  });

  test('that restoring an invalid secret key shows an error', async ({
    switchAccountPage,
    page,
  }) => {
    await switchAccountPage.open();
    await switchAccountPage.openAddWalletSheet();
    await page.getByText('Restore wallet').click();
    await page.getByText('Have a 12-word Secret Key?').click();

    for (let i = 0; i < 12; i++) {
      await page.getByTestId(`mnemonic-input-${i + 1}`).fill('notaword');
    }

    await expect(page.getByTestId(OnboardingSelectors.SignInSeedError)).toBeVisible();
    expect(await switchAccountPage.getWalletCount()).toBe(1);
  });

  test('that the rename dialog disables save for an empty name', async ({
    switchAccountPage,
    page,
  }) => {
    await switchAccountPage.open();
    await switchAccountPage.enterManageMode();
    await switchAccountPage.openWalletMenu(0);
    await switchAccountPage.clickMenuItem('Rename');

    await page.getByTestId(SwitchAccountSelectors.RenameWalletInput).fill('   ');

    await expect(page.getByTestId(SwitchAccountSelectors.RenameWalletSaveBtn)).toBeDisabled();
  });

  test('that each wallet activates its own signing key', async ({
    switchAccountPage,
    homePage,
    page,
  }) => {
    test.setTimeout(180_000);
    // Adding a second wallet makes it active. Its receive address is derived
    // from a distinct key, so it must differ from the first wallet's known
    // address — proving the new wallet does not reuse the first wallet's key.
    await switchAccountPage.open();
    await switchAccountPage.addNewWallet(TEST_PASSWORD);

    const secondWalletAddress = await homePage.getReceiveNativeSegwitAddress();
    expect(secondWalletAddress).not.toBe(TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS);
    await page.keyboard.press('Escape');
    await homePage.waitForHomePageReady();

    // Removing the active second wallet must reassign the first wallet (its
    // original key, account 0) as active — not leave a dangling or swapped key.
    await switchAccountPage.open();
    await switchAccountPage.enterManageMode();
    await switchAccountPage.removeWallet(1);

    await expect
      .poll(async () => await switchAccountPage.getActiveAccount())
      .toMatchObject({ fingerprint: testFingerprint, accountIndex: 0 });
  });

  test('that removing a wallet purges its account name and hidden metadata', async ({
    switchAccountPage,
  }) => {
    // Account metadata lives on entities keyed by `fingerprint/accountIndex` in
    // the accounts slice. If it survives removal, re-adding the same Secret Key
    // silently restores stale names and hidden accounts. Removal must cascade.
    test.slow();
    await switchAccountPage.open();
    await switchAccountPage.enterManageMode();
    await switchAccountPage.renameAccount('Leaky name', 0);
    await switchAccountPage.hideAccount(1);

    await expect
      .poll(() => switchAccountPage.getPersistedAccount(`${testFingerprint}/0`))
      .toMatchObject({ name: 'Leaky name' });
    await expect
      .poll(() => switchAccountPage.getPersistedAccount(`${testFingerprint}/1`))
      .toMatchObject({ status: 'hidden' });

    await switchAccountPage.exitManageMode();
    await switchAccountPage.addNewWallet(TEST_PASSWORD);

    await switchAccountPage.open();
    await switchAccountPage.enterManageMode();
    await switchAccountPage.removeWallet(0);

    await expect
      .poll(async () => {
        const ids = await switchAccountPage.getPersistedAccountIds();
        return ids.filter(id => id.startsWith(`${testFingerprint}/`)).length;
      })
      .toBe(0);
  });

  test('that a software wallet shows no Ledger indication', async ({ switchAccountPage, page }) => {
    await expect(page.getByTestId(AccountSelectors.LedgerIndicator)).toHaveCount(0);

    await switchAccountPage.open();
    await expect(page.getByTestId(SwitchAccountSelectors.WalletHeaderLedgerIndicator)).toHaveCount(
      0
    );
  });

  test('that removing a wallet also removes its stx chain state', async ({ switchAccountPage }) => {
    test.slow();
    await switchAccountPage.open();
    await switchAccountPage.addNewWallet(TEST_PASSWORD);

    const active = await switchAccountPage.getActiveAccount();
    const removedFingerprint = active?.fingerprint;
    if (!removedFingerprint) throw new Error('expected the new wallet to be active');
    expect(removedFingerprint).not.toBe(testFingerprint);

    await expect
      .poll(() => switchAccountPage.getPersistedStxChainFingerprints())
      .toEqual(expect.arrayContaining([testFingerprint, removedFingerprint]));

    await switchAccountPage.open();
    await switchAccountPage.enterManageMode();
    await switchAccountPage.removeWallet(1);

    await expect
      .poll(() => switchAccountPage.getPersistedStxChainFingerprints())
      .not.toContain(removedFingerprint);
    expect(await switchAccountPage.getPersistedStxChainFingerprints()).toContain(testFingerprint);
  });
});

test.describe('Multiwallet hardware wallet', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockBnsV2NamesRequestEmpty(page);
    await onboardingPage.signInWithLedgerAccount(
      extensionId,
      makeLedgerTestAccountWalletState(['bitcoin', 'stacks'])
    );
  });

  test('that a hardware wallet menu does not offer viewing the secret key', async ({
    switchAccountPage,
    page,
  }) => {
    test.slow();
    await switchAccountPage.open();
    await switchAccountPage.enterManageMode();
    await switchAccountPage.openWalletMenu(0);

    await expect(page.getByRole('menuitem', { name: 'Rename' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'View Secret Key' })).toHaveCount(0);
  });

  test('that a Ledger wallet shows the Ledger chip on the wallet header and a badge on each account', async ({
    switchAccountPage,
    page,
  }) => {
    test.slow();
    // Flat surface: the active Ledger account's avatar carries the corner badge
    await expect(page.getByTestId(AccountSelectors.LedgerIndicator).first()).toBeVisible();

    await switchAccountPage.open();

    // Grouped surface: the wallet header carries the labelled "Ledger" chip
    await expect(
      page.getByTestId(SwitchAccountSelectors.WalletHeaderLedgerIndicator).first()
    ).toBeVisible();

    // Each account avatar also carries the badge: home header + the account row
    await expect(page.getByTestId(AccountSelectors.LedgerIndicator)).toHaveCount(2);
  });
});
