import { Locator, Page } from '@playwright/test';
import { CollectibleDetailsSelectors } from '@tests/selectors/collectible-details.selectors';

export class CollectibleDetailsPage {
  readonly page: Page;
  readonly container: Locator;
  readonly backButton: Locator;
  readonly sendButton: Locator;
  readonly optionsButton: Locator;
  readonly viewOriginalMenuItem: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId(CollectibleDetailsSelectors.CollectibleDetailsContainer);
    this.backButton = page.getByTestId(CollectibleDetailsSelectors.CollectibleDetailsBack);
    this.sendButton = page.getByTestId(CollectibleDetailsSelectors.CollectibleDetailsSend);
    this.optionsButton = page.getByTestId(CollectibleDetailsSelectors.CollectibleDetailsOptions);
    this.viewOriginalMenuItem = page.getByTestId(CollectibleDetailsSelectors.ViewOriginalMenuItem);
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

  async clickSip9Card() {
    const card = this.page.getByTestId(CollectibleDetailsSelectors.CollectibleCardSip9);
    await card.first().click();
  }
}
