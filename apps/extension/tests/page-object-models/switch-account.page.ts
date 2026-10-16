import { type Locator, type Page } from '@playwright/test';
import { readPersistedStore } from '@tests/persisted-store';
import { getSwitchAccountSheetAccountNameSelector } from '@tests/selectors/account.selectors';
import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { SwitchAccountSelectors } from '@tests/selectors/switch-account.selectors';

export class SwitchAccountPage {
  readonly page: Page;
  readonly trigger: Locator;
  readonly currentAccountName: Locator;
  readonly addWalletButton: Locator;
  readonly addAccountButton: Locator;
  readonly manageButton: Locator;
  readonly doneButton: Locator;
  readonly selectAccountHeader: Locator;
  readonly manageWalletsHeader: Locator;
  readonly walletHeaderNames: Locator;
  readonly walletActionMenuTriggers: Locator;
  readonly accountActionMenuTriggers: Locator;

  constructor(page: Page) {
    this.page = page;
    this.trigger = page.getByTestId(SettingsSelectors.SigningAccountCard);
    this.currentAccountName = page.getByTestId(SettingsSelectors.CurrentAccountDisplayName);
    this.addWalletButton = page.getByRole('button', { name: 'Add wallet' });
    this.addAccountButton = page.getByTestId(SwitchAccountSelectors.CreateAccountBtn);
    this.manageButton = page.getByRole('button', { name: 'Manage' });
    this.doneButton = page.getByRole('button', { name: 'Done' });
    this.selectAccountHeader = page.getByRole('heading', { name: 'Select account' });
    this.manageWalletsHeader = page.getByRole('heading', { name: 'Manage wallets' });
    this.walletHeaderNames = page.getByTestId(SwitchAccountSelectors.WalletHeaderName);
    this.walletActionMenuTriggers = page.getByTestId(
      SwitchAccountSelectors.WalletActionMenuTrigger
    );
    this.accountActionMenuTriggers = page.getByTestId(
      SwitchAccountSelectors.AccountActionMenuTrigger
    );
  }

  async open() {
    await this.trigger.click();
    await this.selectAccountHeader.waitFor();
  }

  async close() {
    await this.page.keyboard.press('Escape');
    await this.selectAccountHeader.waitFor({ state: 'hidden' });
  }

  async getWalletCount() {
    const store = await readPersistedStore(this.page);
    const wallets = store?.wallets;
    return wallets?.ids?.length ?? 0;
  }

  async getActiveAccount() {
    const store = await readPersistedStore(this.page);
    const active = store?.active;
    return active?.account ?? null;
  }

  accountName(accountIndex: number) {
    return this.page.getByTestId(getSwitchAccountSheetAccountNameSelector(accountIndex));
  }

  accountRow(accountIndex: number) {
    return this.page.getByTestId(`switch-account-item-${accountIndex}`);
  }

  async getPersistedAccountIds() {
    const store = await readPersistedStore(this.page);
    const accounts = store?.accounts;
    return accounts?.ids ?? [];
  }

  async getPersistedAccount(accountId: string) {
    const store = await readPersistedStore(this.page);
    const accounts = store?.accounts;
    return accounts?.entities?.[accountId] ?? null;
  }

  async getPersistedStxChainFingerprints() {
    const store = await readPersistedStore(this.page);
    const stx = store?.chains?.stx;
    return stx ? Object.keys(stx) : [];
  }

  async getHighestAccountIndex(fingerprint: string) {
    const store = await readPersistedStore(this.page);
    const stx = store?.chains?.stx;
    return stx?.[fingerprint]?.highestAccountIndex ?? -1;
  }

  async selectAccount(accountIndex: number) {
    await this.page.getByTestId(`switch-account-item-${accountIndex}`).click();
  }

  policyRow(policyId: string) {
    return this.page.getByTestId(`switch-account-policy-${policyId}`);
  }

  async openPolicyMenu(nth = 0) {
    await this.page.getByTestId(SwitchAccountSelectors.PolicyActionMenuTrigger).nth(nth).click();
  }

  async renamePolicy(name: string, nth = 0) {
    await this.openPolicyMenu(nth);
    await this.clickMenuItem('Rename');
    await this.page.getByTestId(SwitchAccountSelectors.RenamePolicyInput).fill(name);
    await this.page.getByTestId(SwitchAccountSelectors.RenamePolicySaveBtn).click();
  }

  async removePolicy(nth = 0) {
    await this.openPolicyMenu(nth);
    await this.clickMenuItem('Remove');
    await this.page.getByTestId(SwitchAccountSelectors.RemovePolicyConfirmBtn).click();
  }

  async getPersistedPolicyIds() {
    const store = await readPersistedStore(this.page);
    const policy = store?.policy;
    return policy?.ids ?? [];
  }

  async getActivePolicyId() {
    const store = await readPersistedStore(this.page);
    const active = store?.active;
    return active?.activePolicyId ?? null;
  }

  async addAccount(nth = 0) {
    await this.page.getByTestId(SwitchAccountSelectors.CreateAccountBtn).nth(nth).click();
    await this.selectAccountHeader.waitFor({ state: 'hidden' });
  }

  async enterManageMode() {
    await this.manageButton.click();
    await this.manageWalletsHeader.waitFor();
  }

  async exitManageMode() {
    await this.doneButton.click();
    await this.selectAccountHeader.waitFor();
  }

  async openAddWalletMenu() {
    await this.addWalletButton.click();
    await this.page.getByRole('menuitem', { name: 'Create new wallet' }).waitFor();
  }

  async createNewWallet() {
    await this.openAddWalletMenu();
    await this.clickMenuItem('Create new wallet');
  }

  clickMenuItem(name: string) {
    return this.page.getByRole('menuitem', { name }).click();
  }

  async openWalletMenu(nth = 0) {
    await this.walletActionMenuTriggers.nth(nth).click();
  }

  async openAccountMenu(nth: number) {
    await this.accountActionMenuTriggers.nth(nth).click();
  }

  async renameWallet(name: string, nth = 0) {
    await this.openWalletMenu(nth);
    await this.clickMenuItem('Rename');
    await this.page.getByTestId(SwitchAccountSelectors.RenameWalletInput).fill(name);
    await this.page.getByTestId(SwitchAccountSelectors.RenameWalletSaveBtn).click();
  }

  async openRenameAccount(nth = 0) {
    await this.openAccountMenu(nth);
    await this.clickMenuItem('Rename');
  }

  renameAccountInput() {
    return this.page.getByTestId(SwitchAccountSelectors.RenameAccountInput);
  }

  async saveRenameAccount() {
    await this.page.getByTestId(SwitchAccountSelectors.RenameAccountSaveBtn).click();
  }

  async renameAccount(name: string, nth = 0) {
    await this.openRenameAccount(nth);
    await this.renameAccountInput().fill(name);
    await this.saveRenameAccount();
  }

  async clearAccountName(nth = 0) {
    await this.openRenameAccount(nth);
    await this.renameAccountInput().fill('');
    await this.saveRenameAccount();
  }

  async removeWallet(nth: number) {
    await this.openWalletMenu(nth);
    await this.clickMenuItem('Remove wallet');
    await this.page.getByTestId(SwitchAccountSelectors.RemoveWalletConfirmBtn).click();
  }

  async hideAccount(nth: number) {
    await this.openAccountMenu(nth);
    await this.clickMenuItem('Hide');
  }

  async showAccount(nth: number) {
    await this.openAccountMenu(nth);
    await this.clickMenuItem('Show');
  }

  async viewSecretKey(nth = 0) {
    await this.openWalletMenu(nth);
    await this.clickMenuItem('View Secret Key');
  }

  async addNewWallet(password: string) {
    await this.createNewWallet();
    await this.page.getByTestId(OnboardingSelectors.BackUpSecretKeyBtn).click();
    await this.page.getByTestId(OnboardingSelectors.NewPasswordInput).fill(password);
    await this.page.getByTestId(OnboardingSelectors.SetPasswordBtn).click();
    await this.page.getByTestId(HomePageSelectors.HomePageContainer).waitFor();
  }

  async restoreWallet(mnemonic: string, password: string) {
    await this.openAddWalletMenu();
    await this.clickMenuItem('Restore wallet');
    const words = mnemonic.split(' ');
    if (words.length === 12) {
      await this.page.getByText('Have a 12-word Secret Key?').click();
    }
    for (let i = 0; i < words.length; i++) {
      await this.page.getByTestId(`mnemonic-input-${i + 1}`).fill(words[i]);
    }
    await this.page.getByTestId(OnboardingSelectors.SignInBtn).click();
    await this.page.getByTestId(OnboardingSelectors.NewPasswordInput).fill(password);
    await this.page.getByTestId(OnboardingSelectors.SetPasswordBtn).click();
    await this.page.getByTestId(HomePageSelectors.HomePageContainer).waitFor();
  }
}
