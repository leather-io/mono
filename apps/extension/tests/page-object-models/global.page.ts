import { type Page } from '@playwright/test';
import { setupMockApis } from '@tests/mocks/mock-apis';
import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';

export class GlobalPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async gotoNakedRoot(extensionId: string) {
    await this.page.goto(`chrome-extension://${extensionId}/index.html`);
  }

  async setupAndUseApiCalls(extensionId: string) {
    const context = this.page.context();
    await context.route(/.*/, route => route.continue());
    await setupMockApis(context);
    await this.gotoNakedRoot(extensionId);
    await this.page
      .getByTestId(OnboardingSelectors.SignUpBtn)
      .or(this.page.getByTestId(HomePageSelectors.HomePageContainer))
      .first()
      .waitFor();
  }

  async setupAndUseMockedApiCalls(extensionId: string) {
    await this.page.route(/.*/, route => route.abort());
    await setupMockApis(this.page);
    await this.gotoNakedRoot(extensionId);
  }
}
