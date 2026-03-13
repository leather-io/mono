import { Locator, Page } from '@playwright/test';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';

export class SettingsPage {
  readonly settingsMenuBtn: Locator;
  readonly unprotectAllInscriptionsItem: Locator;
  readonly manageInscriptionsItem: Locator;

  constructor(readonly page: Page) {
    this.settingsMenuBtn = page.getByTestId(SettingsSelectors.SettingsMenuBtn);
    this.unprotectAllInscriptionsItem = page.getByTestId(
      SettingsSelectors.UnprotectAllInscriptions
    );
    this.manageInscriptionsItem = page.getByTestId(SettingsSelectors.ManageInscriptions);
  }

  async openSettingsMenu() {
    await this.settingsMenuBtn.click();
  }

  async openSettingsPage() {
    await this.page.getByTestId(SettingsSelectors.SettingsMenuBtn).click();
    await this.page.getByTestId(SettingsSelectors.SettingsMenuItem).click();
    await this.page.getByTestId(SettingsSelectors.SettingsPage).isVisible();
  }

  async openViewSecretKeyPage() {
    await this.page.getByTestId(SettingsSelectors.SettingsMenuBtn).click();
    await this.page.getByTestId(SettingsSelectors.SettingsMenuItem).click();
    await this.page.getByTestId(SettingsSelectors.SettingsPage).isVisible();
    await this.page.getByTestId(SettingsSelectors.ViewSecretKeyListItem).click();
  }

  async clickUnprotectAllInscriptions() {
    await this.openSettingsMenu();
    await this.unprotectAllInscriptionsItem.click();
  }

  async clickManageInscriptions() {
    await this.openSettingsMenu();
    await this.manageInscriptionsItem.click();
  }
}
