import { Page } from '@playwright/test';
import { TEST_PASSWORD } from '@tests/mocks/constants';
import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { seedSoftwareWallet } from '@tests/utils';

import { delay } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

export {
  makeLedgerTestAccountWalletState,
  testSoftwareAccountDefaultWalletState,
} from '@tests/fixtures/wallet-state';

export const TEST_ACCOUNT_SECRET_KEY = process.env.EXTENSION_INTEGRATION_TEST_MNEMONIC ?? '';

export class OnboardingPage {
  constructor(readonly page: Page) {}

  async setPassword() {
    await this.page.waitForURL('**' + RouteUrls.SetPassword);
    await this.page.getByTestId(OnboardingSelectors.NewPasswordInput).fill(TEST_PASSWORD);
    await this.page.waitForTimeout(100);
    await this.page.getByTestId(OnboardingSelectors.SetPasswordBtn).click();
  }

  async signUpNewUser() {
    await this.page.getByTestId(OnboardingSelectors.SignUpBtn).click();
    await this.page.waitForURL('**' + RouteUrls.BackUpSecretKey);
    await this.page.getByTestId(OnboardingSelectors.BackUpSecretKeyBtn).click();
    await this.setPassword();
  }
  async initiateSignIn() {
    await this.page.getByTestId(OnboardingSelectors.SignInLink).click();
  }

  /**
   * Use this to test the onboarding flow by going through step-by-step
   */
  async signInExistingUser(secretKey = TEST_ACCOUNT_SECRET_KEY) {
    await this.initiateSignIn();
    await this.enterMnemonicKey(secretKey);
    await this.page.getByTestId(OnboardingSelectors.SignInBtn).click();
    await this.setPassword();
    await this.page.waitForURL('**' + RouteUrls.Home);
    await this.page.getByTestId(HomePageSelectors.HomePageContainer).waitFor();
  }

  async signInMnemonicKey(secretKey = TEST_ACCOUNT_SECRET_KEY) {
    await this.initiateSignIn();
    await this.enterMnemonicKey(secretKey);
  }
  async enterMnemonicKey(secretKey: string) {
    // NOTE: TEST_ACCOUNT_SECRET_KEY needs to be obtained and set in .env
    if (!secretKey) throw new Error('No key found');
    const key = secretKey.split(' ');
    for (let i = 0; i < key.length; i++) {
      await this.page.getByTestId(`mnemonic-input-${i + 1}`).fill(key[i]);
    }
  }

  /**
   * Use this for tests that just need to be signed in. This will skip the
   * onboarding flow and initialise the wallet in a signed in state for the test
   * account
   */
  async signInWithTestAccount(id: string) {
    await seedSoftwareWallet(this.page, id);
    await this.page.waitForFunction(() => Boolean(window.debug?.setHighestAccountIndex));
    await this.page.evaluate(() => window.debug.setHighestAccountIndex(2));
  }

  /**
   * Use this for tests that just need to be signed in. This will skip the
   * onboarding flow and initialise the wallet in a signed in state for the test
   * account
   */
  async signInWithLedgerAccount(id: string, state: object) {
    // @kyranjamie: completely unclear to me why, but after the work in
    // https://github.com/leather-io/extension/pull/6217 I had to add these
    // delays to get Ledger tests to run, otherwise either 1) the popup wouldn't
    // open or 2) the popup would open but it would load the unsigned in state.
    // This behaviour took place before I upgraded the playwright version in
    // that PR.
    await delay(2000);
    await this.page.evaluate(
      async walletState => chrome.storage.local.set({ 'persist:root': walletState }),
      state
    );
    await delay(2000);
    await this.page.goto(`chrome-extension://${id}/index.html`);
    await delay(2000);
  }
}
