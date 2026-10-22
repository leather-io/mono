import { type Page } from '@playwright/test';
import { setupMockApis } from '@tests/mocks/mock-apis';
import { mockUnhandledRequests } from '@tests/mocks/mock-unhandled-requests';
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

  async waitForOnboardingOrHome() {
    await this.page
      .getByTestId(OnboardingSelectors.SignUpBtn)
      .or(this.page.getByTestId(HomePageSelectors.HomePageContainer))
      .first()
      .waitFor();
  }

  async setupAndUseApiCalls(extensionId: string) {
    const context = this.page.context();
    await mockUnhandledRequests(context);
    await setupMockApis(context);
    await this.gotoNakedRoot(extensionId);
    await this.waitForOnboardingOrHome();
  }

  async setupAndUseMockedApiCalls(extensionId: string) {
    await this.page.route(/.*/, route => route.abort());
    await setupMockApis(this.page);
    await this.gotoNakedRoot(extensionId);
  }
}
