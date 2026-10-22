import { type BrowserContext, type Page, test as base } from '@playwright/test';
import {
  type LaunchedExtension,
  disableAnimations,
  getInitialPage,
  launchExtensionContext,
} from '@tests/fixtures/launch-extension';
import { GlobalPage } from '@tests/page-object-models/global.page';
import { HomePage } from '@tests/page-object-models/home.page';
import { NetworkPage } from '@tests/page-object-models/network.page';
import { OnboardingPage } from '@tests/page-object-models/onboarding.page';
import { SendPage } from '@tests/page-object-models/send.page';
import { SettingsPage } from '@tests/page-object-models/settings.page';
import { SwapRevampPage } from '@tests/page-object-models/swap-revamp.page';
import { SwitchAccountPage } from '@tests/page-object-models/switch-account.page';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

interface TestFixtures {
  launchedExtension: LaunchedExtension;
  context: BrowserContext;
  page: Page;
  extensionId: string;
  globalPage: GlobalPage;
  homePage: HomePage;
  onboardingPage: OnboardingPage;
  sendPage: SendPage;
  swapRevampPage: SwapRevampPage;
  networkPage: NetworkPage;
  settingsPage: SettingsPage;
  switchAccountPage: SwitchAccountPage;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Loads the extension into the browser context. Use this test function with
 * Playwright to avoid having to manually load the extension into the browser
 * context in each test. Created by following,
 * https://playwright.dev/docs/chrome-extensions
 */
export const test = base.extend<TestFixtures>({
  // Playwright always needs object destructuring for fixtures https://github.com/microsoft/playwright/issues/14590
  // eslint-disable-next-line no-empty-pattern
  async launchedExtension({}, use) {
    const pathToExtension = path.join(__dirname, '../../dist');
    const launchedExtension = await launchExtensionContext(pathToExtension);
    await use(launchedExtension);
    await launchedExtension.context.close();
    await launchedExtension.context.browser()?.close();
  },
  async context({ launchedExtension }, use) {
    await use(launchedExtension.context);
  },
  async page({ context }, use) {
    const page = await getInitialPage(context);
    await disableAnimations(page);
    await use(page);
  },
  async extensionId({ launchedExtension }, use) {
    await use(launchedExtension.extensionId);
  },
  async globalPage({ page }, use) {
    await use(new GlobalPage(page));
  },
  async homePage({ page }, use) {
    await use(new HomePage(page));
  },
  async onboardingPage({ page }, use) {
    await use(new OnboardingPage(page));
  },
  async sendPage({ page }, use) {
    await use(new SendPage(page));
  },
  async swapRevampPage({ page }, use) {
    await use(new SwapRevampPage(page));
  },
  async networkPage({ page }, use) {
    await use(new NetworkPage(page));
  },
  async settingsPage({ page }, use) {
    await use(new SettingsPage(page));
  },
  async switchAccountPage({ page }, use) {
    await use(new SwitchAccountPage(page));
  },
});
