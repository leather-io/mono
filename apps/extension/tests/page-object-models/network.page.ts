import { Page } from '@playwright/test';
import { NetworkSelectors } from '@tests/selectors/network.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { createTestSelector } from '@tests/utils';

import { WalletDefaultNetworkConfigurationIds } from '@leather.io/models';

import { SettingsPage } from './settings.page';

export class NetworkPage {
  readonly networkNameSelector = createTestSelector(NetworkSelectors.NetworkName);
  readonly networkStacksAddressSelector = createTestSelector(NetworkSelectors.NetworkStacksAddress);
  readonly networkBitcoinAddressSelector = createTestSelector(
    NetworkSelectors.NetworkBitcoinAddress
  );
  readonly networkKeySelector = createTestSelector(NetworkSelectors.NetworkKey);
  readonly btnAddNetworkSelector = createTestSelector(NetworkSelectors.AddNetworkBtn);
  readonly errorTextSelector = createTestSelector(NetworkSelectors.ErrorText);

  settingsPage: SettingsPage;

  constructor(readonly page: Page) {
    this.settingsPage = new SettingsPage(page);
  }

  async waitForNetworkPageReady() {
    await this.page.waitForSelector(createTestSelector(NetworkSelectors.NetworkPageReady), {
      state: 'attached',
    });
  }

  async inputNetworkNameField(input: string) {
    await this.page.locator(this.networkNameSelector).fill(input);
  }

  async inputNetworkStacksAddressField(input: string) {
    await this.page.locator(this.networkStacksAddressSelector).fill(input);
  }

  async inputNetworkBitcoinAddressField(input: string) {
    await this.page.locator(this.networkBitcoinAddressSelector).fill(input);
  }

  async inputNetworkKeyField(input: string) {
    await this.page.locator(this.networkKeySelector).fill(input);
  }

  async waitForErrorMessage() {
    await this.page.waitForSelector(this.errorTextSelector);
  }

  getErrorMessage() {
    return this.page.locator(this.errorTextSelector);
  }

  async clickAddNetwork() {
    await this.page.locator(this.btnAddNetworkSelector).click({ force: true });
  }

  async openNetworkPage() {
    await this.settingsPage.openSettingsPage();
    await this.page.getByTestId(SettingsSelectors.ChangeNetworkAction).click();
    await this.page.getByTestId(NetworkSelectors.NetworkListActiveNetwork).isVisible();
  }

  async openAddNewNetworkPage() {
    await this.openNetworkPage();
    await this.page.getByTestId(SettingsSelectors.AddNewNetworkBtn).click();
    await this.waitForNetworkPageReady();
  }

  async goBackToHome() {
    await this.page.getByTestId(SharedComponentsSelectors.HeaderBackBtn).click();
    await this.page.getByTestId(SettingsSelectors.SettingsPage).isVisible();
    await this.page.getByTestId(SharedComponentsSelectors.HeaderBackBtn).click();
  }

  async changeNetwork(network: WalletDefaultNetworkConfigurationIds) {
    await this.openNetworkPage();
    await this.page.getByTestId(network).click();
    await this.goBackToHome();
  }

  async selectTestnet() {
    await this.changeNetwork(WalletDefaultNetworkConfigurationIds.testnet4);
  }
}
