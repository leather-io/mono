import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';

import { RouteUrls } from '@shared/route-urls';

import type { ExtensionFeatureEntry } from './extension-feature-entry';

const onboardingSpec = 'apps/extension/tests/specs/onboarding/onboarding.spec.ts';
const settingsSpec = 'apps/extension/tests/specs/settings/settings.spec.ts';
const walletLockSpec = 'apps/extension/tests/specs/settings/wallet-lock.spec.ts';
const signOutMultiwalletSpec = 'apps/extension/tests/specs/settings/sign-out-multiwallet.spec.ts';
const signOutRecreateWalletSpec =
  'apps/extension/tests/specs/settings/sign-out-recreate-wallet.spec.ts';

export const onboardingFeatures = [
  {
    id: 'welcome',
    anchor: { kind: 'route' },
    routes: [RouteUrls.Onboarding],
    params: [],
    entry: [
      {
        kind: 'deepLink',
        steps: [
          'Open the extension with no wallet; AccountGate redirects every wallet route to /get-started',
          'Or open #/get-started directly',
        ],
      },
      {
        kind: 'nav',
        steps: [
          'Settings menu → "Sign out" → tick every backup checkbox and the password checkbox → "Sign out" in the sign-out sheet (sign-out-sheet entry); the app lands on /get-started',
        ],
      },
    ],
    gate: 'onboarding',
    flags: [],
    preconditions: { session: 'signed-out', mocks: ['setupMockApis', 'mockUnhandledRequests'] },
    selectors: {
      ready: OnboardingSelectors.SignUpBtn,
      others: [OnboardingSelectors.SignInLink],
    },
    actions: [
      'GlobalPage.setupAndUseApiCalls',
      'OnboardingPage.signUpNewUser',
      'OnboardingPage.initiateSignIn',
      'HomePage.signOut',
    ],
    specs: [
      onboardingSpec,
      settingsSpec,
      walletLockSpec,
      signOutMultiwalletSpec,
      signOutRecreateWalletSpec,
    ],
    description:
      'The welcome screen shown when no wallet exists, with three buttons (welcome.layout.tsx). In full-page mode "Create new wallet" navigates to /back-up-secret-key, which generates a new key each time it mounts, "Use existing key" goes to /sign-in, and "Use Ledger" opens the Ledger connect flow (the unsupported-browser screen when WebHID is unavailable; welcome.tsx). The "Use Ledger" button has no test id, so a repro clicks it by text. In popup mode "Create new wallet" opens /get-started in a new full-page tab and closes the popup, "Use existing key" opens /sign-in the same way, and "Use Ledger" hands the Ledger flow off to a full-page tab. The page shows a plain Leather logo without a test id. OnboardingGate sends users with an existing software or Ledger key to / (unlocked) or /unlock. settings.spec, sign-out-multiwallet.spec and wallet-lock.spec (sign out while locked) assert SignUpBtn here after signing out; sign-out-recreate-wallet.spec only waits for /get-started and signs up again.',
  },
  {
    id: 'back-up-secret-key',
    anchor: { kind: 'route' },
    routes: [RouteUrls.BackUpSecretKey],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On /get-started click "Create new wallet"; the app navigates to /back-up-secret-key',
        ],
      },
    ],
    gate: 'onboarding',
    flags: [],
    preconditions: { session: 'signed-out', mocks: ['setupMockApis', 'mockUnhandledRequests'] },
    selectors: {
      ready: OnboardingSelectors.BackUpSecretKeyBtn,
      others: [
        SettingsSelectors.ShowSecretKeyBtn,
        SettingsSelectors.CopyKeyToClipboardBtn,
        OnboardingSelectors.NewPasswordInput,
        OnboardingSelectors.SetPasswordBtn,
      ],
    },
    actions: ['OnboardingPage.signUpNewUser', 'OnboardingPage.setPassword'],
    specs: [onboardingSpec, signOutRecreateWalletSpec, signOutMultiwalletSpec],
    description:
      'Shows a freshly generated 24-word Secret Key (generated when the page mounts, back-up-secret-key.tsx, so every visit makes a new key; generateMnemonic uses 256 bits, packages/crypto/src/keychain.ts) with reveal and copy controls, then "I\'ve backed it up" opens the set-password step on the same route; with no existing software keys the step is titled "Set a password" and validates strength. Setting a password encrypts the key and navigates to /, where the multi-wallet feature introducer shows (on Home, not on this page; OnboardingPage.dismissFeatureIntroducer closes it there). The same page is reused at /create-wallet (AccountGate) when adding a wallet from the account switcher. The specs that sign up here (onboarding.spec "Activity tab", sign-out-recreate-wallet.spec, sign-out-multiwallet.spec) override the Stacks balance endpoints with inline page.route zero balances to stop account discovery, and onboarding.spec also registers mockLeatherBitcoinTransactions(page, []) for an empty activity list.',
  },
  {
    id: 'sign-in',
    anchor: { kind: 'route' },
    routes: [RouteUrls.SignIn],
    params: [],
    entry: [
      { kind: 'nav', steps: ['On /get-started click "Use existing key"'] },
      { kind: 'deepLink', steps: ['Open #/sign-in while no wallet exists'] },
    ],
    gate: 'onboarding',
    flags: [],
    preconditions: { session: 'signed-out', mocks: ['setupMockApis', 'mockUnhandledRequests'] },
    selectors: {
      ready: OnboardingSelectors.SignInBtn,
      others: [
        OnboardingSelectors.SignInSeedError,
        OnboardingSelectors.NewPasswordInput,
        OnboardingSelectors.SetPasswordBtn,
      ],
    },
    actions: [
      'OnboardingPage.signInExistingUser',
      'OnboardingPage.signInMnemonicKey',
      'OnboardingPage.enterMnemonicKey',
      'OnboardingPage.setPassword',
    ],
    specs: [onboardingSpec],
    description:
      'Restores a wallet from a 12 or 24 word Secret Key. Each word has its own input (data-testid mnemonic-input-1 … mnemonic-input-24). The grid defaults to 24 inputs; click "Have a 12-word Secret Key?" for a 12-word key (enter-mnemonic.tsx). OnboardingPage.enterMnemonicKey does not click that link and fills only as many inputs as the key has words; SwitchAccountPage.restoreWallet does click it. Pasting a whole phrase into an input fills them all and submits immediately, without "Continue" (mnemonic-form.tsx). Invalid words show an inline error and disable the "Continue" button. After the key is accepted the set-password step runs on the same route and the app lands on /.',
  },
  {
    id: 'unlock',
    anchor: { kind: 'route' },
    routes: [RouteUrls.Unlock],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Settings menu → "Lock" (settings-menu entry); the app navigates to /unlock with the current route as from',
          'Or /settings → "Lock App"; that button passes window.location.pathname as from (see description)',
        ],
      },
      {
        kind: 'deepLink',
        steps: [
          'Open any AccountGate route while a software wallet is locked; the gate redirects to /unlock',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'locked', mocks: ['setupMockApis', 'mockUnhandledRequests'] },
    selectors: {
      ready: SettingsSelectors.EnterPasswordInput,
      others: [
        SettingsSelectors.UnlockWalletBtn,
        SettingsSelectors.SettingsMenuBtn,
        OnboardingSelectors.LogoRouteToHome,
      ],
    },
    actions: ['HomePage.lock', 'HomePage.unlock'],
    specs: [
      walletLockSpec,
      onboardingSpec,
      settingsSpec,
      signOutRecreateWalletSpec,
      'apps/extension/tests/specs/security/password-memory-leak.spec.ts',
      'apps/extension/tests/specs/switch-account/multiwallet-integrity.spec.ts',
      'apps/extension/tests/specs/rpc-open/open.spec.ts',
      'apps/extension/tests/specs/rpc-get-addresses/get-addresses.spec.ts',
    ],
    description:
      'Password prompt for a locked software wallet ("Enter your password", button "Continue"). A correct password derives the encryption key (slow on CI) and then, in full-page mode, navigates to the route in the from route state or / when there is none, and in popup mode goes to the previous page (navigate(-1), unlock.tsx). The header settings-menu "Lock" item passes the current router path as from; the /settings "Lock App" button passes window.location.pathname (sticky-buttons.tsx), which under the hash router is the HTML file path, so unlocking after "Lock App" lands on Home instead of /settings; the AccountGate redirect passes nothing. A wrong password shows "The password you entered is invalid" and disables "Continue" until the input changes (request-password.tsx). The header settings menu shows only "Sign out" while locked. The header logo (LogoRouteToHome) navigates home and is hidden from the sm breakpoint up, so full-page runs do not show it. rpc-open/open.spec and rpc-get-addresses/get-addresses.spec cover the popup branch: they lock, start a request and unlock in the popup.',
  },
] as const satisfies readonly ExtensionFeatureEntry[];
