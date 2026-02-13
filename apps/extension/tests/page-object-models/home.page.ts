import { Locator, Page } from '@playwright/test';
import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { createTestSelector } from '@tests/utils';

import { delay } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

export class HomePage {
  readonly page: Page;
  readonly availableBalance: Locator;
  readonly headerActionButton: Locator;
  readonly receiveButton: Locator;
  readonly sendButton: Locator;
  readonly swapButton: Locator;
  readonly settingsButton: Locator;
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
    this.availableBalance = page.getByTestId(HomePageSelectors.AvailableBalance);
    this.headerActionButton = page.getByTestId(SharedComponentsSelectors.HeaderBackBtn);
    this.receiveButton = page.getByTestId(HomePageSelectors.ReceiveCryptoAssetBtn);
    this.sendButton = page.getByTestId(HomePageSelectors.SendCryptoAssetBtn);
    this.swapButton = page.getByTestId(HomePageSelectors.SwapBtn);
    this.settingsButton = page.getByTestId(SettingsSelectors.SettingsMenuBtn);
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
    await this.page.getByTestId(HomePageSelectors.ReceiveCryptoAssetBtn).click();
    await this.page.waitForSelector('[data-state="open"]');
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

  // Currently under Ordinals receive flow
  async getReceiveTaprootAddress() {
    await this.page.evaluate(route => {
      window.location.hash = `/${route}`;
    }, RouteUrls.ReceiveCollectibles);
    await this.page.waitForSelector('[data-state="open"]');
    await this.page.getByTestId(HomePageSelectors.ReceiveBtcTaprootQrCodeBtn).click();
    const displayerAddress = await this.page
      .getByTestId(SharedComponentsSelectors.AddressDisplayer)
      .innerText();
    return displayerAddress.replaceAll('\n', '');
  }

  async getReceiveStxAddress() {
    await this.goToReceiveDialog();
    // In Ledger mode, this element isn't visible, so clicking is conditional
    const qrCodeBtn = this.page.getByTestId(HomePageSelectors.ReceiveStxQrCodeBtn);
    await delay(1000);
    if (await qrCodeBtn.isVisible()) await qrCodeBtn.click({ force: true });
    const displayerAddress = await this.page
      .getByTestId(SharedComponentsSelectors.AddressDisplayer)
      .innerText();
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
    await this.settingsButton.click({ force: true });
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

  async goToManageTokensPage() {
    await this.manageTokensBtn.click();
    await this.page.waitForSelector(`[data-testid="${HomePageSelectors.ManageTokensAssetsList}"]`, {
      state: 'attached',
    });
  }

  async goBackFromManageTokens() {
    await this.headerActionButton.click();
    await this.waitForHomePageReady();
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
