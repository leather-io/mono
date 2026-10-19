import { type Locator, type Page, expect } from '@playwright/test';
import { TEST_PASSWORD } from '@tests/mocks/constants';
import { ActivitySelectors } from '@tests/selectors/activity.selectors';
import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { createTestSelector } from '@tests/utils';

const settingsMenuOpenTimeoutMs = 1000;
const unlockTimeoutMs = 15_000;
const loadedTransactionActionBalance = /Balance: 0\.0*[1-9]\d*\sBTC/;

export class HomePage {
  readonly page: Page;
  readonly availableBalance: Locator;
  readonly headerActionButton: Locator;
  readonly receiveButton: Locator;
  readonly sendButton: Locator;
  readonly swapButton: Locator;
  readonly settingsButton: Locator;
  readonly signOutConfirmHasBackupCheckbox: Locator;
  readonly signOutConfirmHasBackupCheckboxes: Locator;
  readonly signOutConfirmPasswordDisable: Locator;
  readonly signOutDeleteWalletBtn: Locator;
  readonly signOutSettingsListItem: Locator;
  readonly lockSettingsListItem: Locator;
  readonly fundAccountBtn: Locator;
  readonly manageTokensBtn: Locator;
  readonly assetList: Locator;
  readonly manageTokensAssetsList: Locator;

  $signOutConfirmHasBackupCheckbox = createTestSelector(
    SettingsSelectors.SignOutConfirmHasBackupCheckbox
  );
  $signOutConfirmPasswordDisable = createTestSelector(
    SettingsSelectors.SignOutConfirmPasswordDisable
  );
  $signOutDeleteWalletBtn = createTestSelector(SettingsSelectors.BtnSignOutActuallyDeleteWallet);

  constructor(page: Page) {
    this.page = page;
    this.availableBalance = page.getByTestId(HomePageSelectors.AvailableBalance);
    this.headerActionButton = page.getByTestId(SharedComponentsSelectors.HeaderBackBtn);
    this.receiveButton = page.getByTestId(HomePageSelectors.ReceiveCryptoAssetBtn);
    this.sendButton = page.getByTestId(HomePageSelectors.SendCryptoAssetBtn);
    this.swapButton = page.getByTestId(HomePageSelectors.SwapBtn);
    this.settingsButton = page.getByTestId(SettingsSelectors.SettingsMenuBtn);
    this.signOutConfirmHasBackupCheckboxes = page.locator(
      `[data-testid^="${SettingsSelectors.SignOutConfirmHasBackupCheckbox}"]`
    );
    this.signOutConfirmHasBackupCheckbox = this.signOutConfirmHasBackupCheckboxes.first();
    this.signOutConfirmPasswordDisable = page.getByTestId(
      SettingsSelectors.SignOutConfirmPasswordDisable
    );
    this.signOutDeleteWalletBtn = page.getByTestId(
      SettingsSelectors.BtnSignOutActuallyDeleteWallet
    );
    this.signOutSettingsListItem = page.getByTestId(SettingsSelectors.SignOutListItem);
    this.lockSettingsListItem = page.getByTestId(SettingsSelectors.LockListItem);
    this.fundAccountBtn = page.getByTestId(HomePageSelectors.FundAccountBtn);
    this.manageTokensBtn = page.getByTestId(HomePageSelectors.ManageTokensBtn);
    this.assetList = page.getByTestId(HomePageSelectors.AssetList);
    this.manageTokensAssetsList = page.getByTestId(HomePageSelectors.ManageTokensAssetsList);
  }

  async goToReceiveDialog() {
    await this.page.getByTestId(HomePageSelectors.ReceiveCryptoAssetBtn).click();
    await this.page.getByRole('dialog').first().waitFor();
  }

  // Open issue with Playwright's ability to copyToClipboard from legacy tests:
  // https://github.com/microsoft/playwright/issues/8114#issuecomment-1103317576
  // Also, an open issue to consistently determine `isMac` in the workaround:
  // https://github.com/microsoft/playwright/issues/12168
  // Using the `Receive` route to get the account address for now.
  async getReceiveNativeSegwitAddress() {
    await this.goToReceiveDialog();
    await this.page.getByTestId(HomePageSelectors.ReceiveBtcNativeSegwitQrCodeBtn).click();
    const displayerAddress = await this.page
      .getByTestId(SharedComponentsSelectors.AddressDisplayer)
      .innerText();
    return displayerAddress.replaceAll('\n', '');
  }

  async getReceiveStxAddress() {
    await this.goToReceiveDialog();
    // In Ledger mode, this element isn't visible, so clicking is conditional
    const qrCodeBtn = this.page.getByTestId(HomePageSelectors.ReceiveStxQrCodeBtn);
    const addressDisplayer = this.page.getByTestId(SharedComponentsSelectors.AddressDisplayer);
    await qrCodeBtn.or(addressDisplayer).first().waitFor();
    if (await qrCodeBtn.isVisible()) await qrCodeBtn.click();
    const displayerAddress = await addressDisplayer.innerText();
    return displayerAddress.replaceAll('\n', '');
  }

  async clickTokensTab() {
    await this.page.getByTestId(HomePageSelectors.TokensTabBtn).click();
  }

  async clickCollectiblesTab() {
    await this.page.getByTestId(HomePageSelectors.CollectiblesTabBtn).click();
  }

  async clickActivityTab() {
    await this.page.getByTestId(HomePageSelectors.ActivityTabBtn).click();
  }

  async clickSettingsButton() {
    await this.settingsButton.click();
  }

  async signOut() {
    await this.clickSettingsButton();
    await this.signOutSettingsListItem.click();
    const backupCheckboxCount = await this.signOutConfirmHasBackupCheckboxes.count();
    for (let i = 0; i < backupCheckboxCount; i++) {
      await this.signOutConfirmHasBackupCheckboxes.nth(i).check();
    }
    await this.signOutConfirmPasswordDisable.click();
    await this.signOutDeleteWalletBtn.click();
  }

  async unlock(password = TEST_PASSWORD) {
    const passwordInput = this.page.getByTestId(SettingsSelectors.EnterPasswordInput);
    await passwordInput.fill(password);
    await this.page.getByTestId(SettingsSelectors.UnlockWalletBtn).click();
    await expect(passwordInput).toBeHidden({ timeout: unlockTimeoutMs });
  }

  async setBitcoinIncreasedFeeRate(feeRate: string) {
    await expect(this.page.getByTestId(ActivitySelectors.TransactionActionBalance)).toHaveText(
      loadedTransactionActionBalance
    );
    const feeInput = this.page.getByTestId(ActivitySelectors.TransactionActionFeeInput);
    await feeInput.clear();
    await feeInput.fill(feeRate);
  }

  async setStacksTransactionActionFee(action: 'cancel' | 'increase-fee', fee: string) {
    const actionSheet = this.page.getByTestId(
      `${ActivitySelectors.TransactionActionSheet}-${action}`
    );
    await actionSheet.getByTestId(ActivitySelectors.TransactionActionFeeInput).fill(fee);
  }

  async lock() {
    await expect(async () => {
      await this.clickSettingsButton();
      await expect(this.lockSettingsListItem).toBeVisible({ timeout: settingsMenuOpenTimeoutMs });
    }).toPass();
    await this.lockSettingsListItem.click();
  }

  async goToFundChooseCurrencyPage() {
    await this.fundAccountBtn.click();
  }

  async goToManageTokensPage() {
    await this.manageTokensBtn.click();
    await this.page
      .getByTestId(HomePageSelectors.ManageTokensAssetsList)
      .waitFor({ state: 'attached' });
  }

  async goBackFromManageTokens() {
    await this.headerActionButton.click();
    await this.waitForHomePageReady();
  }

  async waitForHomePageReady() {
    await this.page.getByTestId(HomePageSelectors.HomePageContainer).waitFor({ state: 'attached' });
  }

  async switchAccount(accountIndex: number) {
    await this.page.getByTestId(SettingsSelectors.SigningAccountCard).click();
    await this.page.getByTestId(`switch-account-item-${accountIndex}`).click();
  }
}
