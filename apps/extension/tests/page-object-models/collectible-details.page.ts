import { Locator, Page } from '@playwright/test';
import { CollectibleDetailsSelectors } from '@tests/selectors/collectible-details.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';

export class CollectibleDetailsPage {
  readonly page: Page;
  readonly container: Locator;
  readonly backButton: Locator;
  readonly sendButton: Locator;
  readonly optionsButton: Locator;
  readonly viewOriginalMenuItem: Locator;
  readonly protectMenuItem: Locator;
  readonly unprotectMenuItem: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId(CollectibleDetailsSelectors.CollectibleDetailsContainer);
    this.backButton = page.getByTestId(CollectibleDetailsSelectors.CollectibleDetailsBack);
    this.sendButton = page.getByTestId(CollectibleDetailsSelectors.CollectibleDetailsSend);
    this.optionsButton = page.getByTestId(CollectibleDetailsSelectors.CollectibleDetailsOptions);
    this.viewOriginalMenuItem = page.getByTestId(CollectibleDetailsSelectors.ViewOriginalMenuItem);
    this.protectMenuItem = page.getByTestId(CollectibleDetailsSelectors.ProtectMenuItem);
    this.unprotectMenuItem = page.getByTestId(CollectibleDetailsSelectors.UnprotectMenuItem);
  }

  async waitForDetailsPage() {
    await this.container.waitFor({ state: 'visible' });
  }

  async clickSend() {
    await this.sendButton.click();
  }

  async clickBack() {
    await this.backButton.click();
  }

  async openOptionsMenu() {
    await this.optionsButton.click();
  }

  async clickViewOriginal() {
    await this.openOptionsMenu();
    await this.viewOriginalMenuItem.click();
  }

  async clickUnprotect() {
    await this.openOptionsMenu();
    await this.unprotectMenuItem.click();
  }

  async clickProtect() {
    await this.openOptionsMenu();
    await this.protectMenuItem.click();
  }

  async clickInscriptionCard() {
    const card = this.page.getByTestId(CollectibleDetailsSelectors.CollectibleCardInscription);
    await card.first().click();
  }

  async clickSip9Card() {
    const card = this.page.getByTestId(CollectibleDetailsSelectors.CollectibleCardSip9);
    await card.first().click();
  }

  async clickStampCard() {
    const card = this.page.getByTestId(CollectibleDetailsSelectors.CollectibleCardStamp);
    await card.first().click();
  }

  getCollectibleCardByProtocol(protocol: 'inscription' | 'sip9' | 'stamp') {
    return this.page.getByTestId(`collectible-card-${protocol}`);
  }

  async clickManageInscriptions() {
    const settingsButton = this.page.getByTestId(SettingsSelectors.SettingsMenuBtn);
    await settingsButton.click();
    const manageInscriptionsItem = this.page.getByTestId(SettingsSelectors.ManageInscriptions);
    await manageInscriptionsItem.click();
  }

  async clickUnprotectAllInscriptions() {
    const settingsButton = this.page.getByTestId(SettingsSelectors.SettingsMenuBtn);
    await settingsButton.click();
    const unprotectAllItem = this.page.getByTestId(SettingsSelectors.UnprotectAllInscriptions);
    await unprotectAllItem.click();
  }
}
