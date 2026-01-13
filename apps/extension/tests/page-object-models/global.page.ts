import { Page } from '@playwright/test';
import { type FeatureFlagOptions, mockFeatureFlags } from '@tests/mocks/feature-flags';
import { setupMockApis } from '@tests/mocks/mock-apis';

export interface GlobalPageOptions {
  extensionRevamp?: boolean;
}

export class GlobalPage {
  readonly page: Page;
  readonly options: GlobalPageOptions;

  constructor(page: Page, options: GlobalPageOptions = {}) {
    this.page = page;
    this.options = options;
  }

  async gotoNakedRoot(extensionId: string) {
    await this.page.goto(`chrome-extension://${extensionId}/index.html`);
  }

  async setupAndUseApiCalls(extensionId: string, flagOptions?: FeatureFlagOptions) {
    await this.page.route(/.*/, route => route.continue());
    await setupMockApis(this.page);
    const flags = { extensionRevamp: this.options.extensionRevamp, ...flagOptions };
    await mockFeatureFlags(this.page, flags);
    await this.page.waitForTimeout(1500);
    await this.gotoNakedRoot(extensionId);
  }

  async setupAndUseMockedApiCalls(extensionId: string, flagOptions?: FeatureFlagOptions) {
    await this.page.route(/.*/, route => route.abort());
    await setupMockApis(this.page);
    const flags = { extensionRevamp: this.options.extensionRevamp, ...flagOptions };
    await mockFeatureFlags(this.page, flags);
    await this.gotoNakedRoot(extensionId);
  }
}
