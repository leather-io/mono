import { Page } from '@playwright/test';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';

export class SettingsPage {
  constructor(readonly page: Page) {}

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
}
