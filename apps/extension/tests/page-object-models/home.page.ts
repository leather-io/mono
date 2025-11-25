import { Locator, Page } from '@playwright/test';
import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { NetworkSelectors } from '@tests/selectors/network.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { createTestSelector } from '@tests/utils';

import { WalletDefaultNetworkConfigurationIds } from '@leather.io/models';

export class HomePage {
  readonly page: Page;
  readonly headerActionButton: Locator;
  readonly receiveButton: Locator;
  readonly sendButton: Locator;
  readonly swapButton: Locator;
  readonly settingsButton: Locator;
  readonly settingsViewSecretKey: Locator;
  readonly signOutConfirmHasBackupCheckbox: Locator;
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
    this.headerActionButton = page.getByTestId(SharedComponentsSelectors.HeaderBackBtn);
    this.receiveButton = page.getByTestId(HomePageSelectors.ReceiveCryptoAssetBtn);
    this.sendButton = page.getByTestId(HomePageSelectors.SendCryptoAssetBtn);
    this.swapButton = page.getByTestId(HomePageSelectors.SwapBtn);
    this.settingsButton = page.getByTestId(SettingsSelectors.SettingsMenuBtn);
    this.settingsViewSecretKey = page.getByTestId(SettingsSelectors.ViewSecretKeyListItem);
    this.signOutConfirmHasBackupCheckbox = page.getByTestId(
      SettingsSelectors.SignOutConfirmHasBackupCheckbox
    );
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
    const receiveBtn = this.page.getByTestId(HomePageSelectors.ReceiveCryptoAssetBtn);
    await receiveBtn.waitFor({ state: 'visible' });
    await this.page.waitForLoadState('networkidle');
    await receiveBtn.click();
  }

  // Open issue with Playwright's ability to copyToClipboard from legacy tests:
  // https://github.com/microsoft/playwright/issues/8114#issuecomment-1103317576
  // Also, an open issue to consistently determine `isMac` in the workaround:
  // https://github.com/microsoft/playwright/issues/12168
  // Using the `Receive` route to get the account address for now.
  async getReceiveNativeSegwitAddress() {
    await this.goToReceiveDialog();
    const qrCodeBtn = this.page.getByTestId(HomePageSelectors.ReceiveBtcNativeSegwitQrCodeBtn);
    await qrCodeBtn.waitFor({ state: 'attached' });
    await qrCodeBtn.waitFor({ state: 'visible' });
    await this.page.waitForLoadState('domcontentloaded');
    await qrCodeBtn.click();
    const addressDisplayer = this.page.getByTestId(SharedComponentsSelectors.AddressDisplayer);
    await addressDisplayer.waitFor({ state: 'attached' });
    await addressDisplayer.waitFor({ state: 'visible' });
    const displayerAddress = await addressDisplayer.innerText();
    return displayerAddress.replaceAll('\n', '');
  }

  async getReceiveTaprootAddress() {
    await this.goToReceiveDialog();
    const collectiblesTab = this.page.getByTestId(HomePageSelectors.ReceiveCollectiblesTab);
    await collectiblesTab.waitFor({ state: 'attached' });
    await collectiblesTab.waitFor({ state: 'visible' });
    await collectiblesTab.click();
    const taprootBtn = this.page.getByTestId(HomePageSelectors.ReceiveBtcTaprootQrCodeBtn);
    await taprootBtn.waitFor({ state: 'attached' });
    await taprootBtn.waitFor({ state: 'visible' });
    await this.page.waitForLoadState('domcontentloaded');
    await taprootBtn.click();
    const addressDisplayer = this.page.getByTestId(SharedComponentsSelectors.AddressDisplayer);
    await addressDisplayer.waitFor({ state: 'attached' });
    await addressDisplayer.waitFor({ state: 'visible' });
    const displayerAddress = await addressDisplayer.innerText();
    return displayerAddress.replaceAll('\n', '');
  }

  async getReceiveStxAddress() {
    await this.goToReceiveDialog();
    await this.page.waitForLoadState('domcontentloaded');
    const addressDisplayer = this.page.getByTestId(SharedComponentsSelectors.AddressDisplayer);
    const qrCodeBtn = this.page.getByTestId(HomePageSelectors.ReceiveStxQrCodeBtn);
    const addressAlreadyVisible = await addressDisplayer
      .isVisible()
      .catch(() => false);
    if (!addressAlreadyVisible) {
      await qrCodeBtn.waitFor({ state: 'attached' });
      await qrCodeBtn.waitFor({ state: 'visible' });
      await qrCodeBtn.click();
    }
    await addressDisplayer.waitFor({ state: 'attached' });
    await addressDisplayer.waitFor({ state: 'visible' });
    const displayerAddress = await addressDisplayer.innerText();
    return displayerAddress.replaceAll('\n', '');
  }

  async selectTestnet() {
    await this.page.getByTestId(SettingsSelectors.SettingsMenuBtn).click();
    await this.page.getByTestId(SettingsSelectors.ChangeNetworkAction).click();
    await this.page.getByTestId(NetworkSelectors.NetworkListActiveNetwork).isVisible();
    await this.page.getByTestId(WalletDefaultNetworkConfigurationIds.testnet4).click();
  }

  async clickActivityTab() {
    await this.page.getByTestId(HomePageSelectors.ActivityTabBtn).click();
  }

  async clickSettingsButton() {
    await this.settingsButton.click({ force: true });
  }

  async goToSecretKey() {
    await this.clickSettingsButton();
    await this.settingsViewSecretKey.click();
  }

  async signOut() {
    await this.clickSettingsButton();
    await this.signOutSettingsListItem.click();
    await this.signOutConfirmHasBackupCheckbox.click();
    await this.signOutConfirmPasswordDisable.click();
    await this.signOutDeleteWalletBtn.click();
  }

  async lock() {
    await this.clickSettingsButton();
    await this.lockSettingsListItem.click();
  }

  async goToFundChooseCurrencyPage() {
    await this.fundAccountBtn.click();
  }

  async waitForHomePageReady() {
    await this.page.waitForSelector(createTestSelector(HomePageSelectors.HomePageContainer), {
      state: 'attached',
    });
  }

  async switchAccount(accountIndex: number) {
    await this.page.getByTestId(SettingsSelectors.SigningAccountCard).click();
    await this.page.getByTestId(`switch-account-item-${accountIndex}`).click();
  }
}
