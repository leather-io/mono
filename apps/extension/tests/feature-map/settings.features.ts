import { AllBalancesSelectors } from '@tests/selectors/all-balances.selectors';
import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import { RouteUrls } from '@shared/route-urls';

import type { ExtensionFeatureEntry } from './extension-feature-entry';

const settingsSpec = 'apps/extension/tests/specs/settings/settings.spec.ts';
const walletLockSpec = 'apps/extension/tests/specs/settings/wallet-lock.spec.ts';
const signOutMultiwalletSpec = 'apps/extension/tests/specs/settings/sign-out-multiwallet.spec.ts';
const signOutRecreateWalletSpec =
  'apps/extension/tests/specs/settings/sign-out-recreate-wallet.spec.ts';
const passwordMemoryLeakSpec = 'apps/extension/tests/specs/security/password-memory-leak.spec.ts';
const allBalancesSpec = 'apps/extension/tests/specs/all-balances/all-balances.spec.ts';
const addNetworkSpec = 'apps/extension/tests/specs/network/add-network.spec.ts';
const sendBtcSpec = 'apps/extension/tests/specs/send/send-btc.spec.ts';
const sendStxSpec = 'apps/extension/tests/specs/send/send-stx.spec.ts';
const defaultMocks = ['setupMockApis', 'mockUnhandledRequests'] as const;

export const settingsFeatures = [
  {
    id: 'settings',
    anchor: { kind: 'route' },
    routes: [RouteUrls.Settings],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Open the header settings menu (settings-menu entry) and click "Settings" (SettingsSelectors.SettingsMenuItem)',
        ],
      },
      { kind: 'deepLink', steps: ['Open #/settings with an unlocked wallet'] },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: SettingsSelectors.SettingsPage,
      others: [
        SettingsSelectors.ViewSecretKeyListItem,
        SettingsSelectors.ToggleTheme,
        AllBalancesSelectors.AllBalancesMenuItem,
        SettingsSelectors.ChangeNetworkAction,
        SettingsSelectors.ToggleNotifications,
        SettingsSelectors.GetSupportMenuItem,
        SettingsSelectors.FeedbackMenuItem,
        SettingsSelectors.LockListItem,
        SettingsSelectors.SignOutListItem,
        SharedComponentsSelectors.HeaderBackBtn,
      ],
    },
    actions: ['SettingsPage.openSettingsPage'],
    specs: [settingsSpec, allBalancesSpec, addNetworkSpec, sendBtcSpec, sendStxSpec],
    description:
      'The Settings page (pages/settings/settings.tsx): a menu of "Secret Key" (only for a software wallet with keys), "Theme", "All balances", "Network", a "Notification" switch, "Help", "Dev docs" (no test id) and "Feedback" (menu-buttons.tsx), with sticky "Lock App" and "Sign Out" buttons at the bottom (sticky-buttons.tsx). "Lock App" shows only when the active wallet is software and its key is in memory, and it shares the LockListItem test id with the settings-menu "Lock" item; it passes window.location.pathname as the unlock from, so unlocking afterwards lands on Home, not /settings. "Sign Out" shares the SignOutListItem test id and opens the sign-out-sheet. "Help" opens the guides in a new tab. The header has only a back button, which goes to the previous page (navigate(-1)), and the network badge (network-switcher entry); there is no settings gear here. SettingsPage.openSettingsPage goes through the header menu and then calls isVisible() on SettingsPage without awaiting a state, so it has no real readiness wait. add-network.spec, send-btc.spec and send-stx.spec pass through this page via NetworkPage.openNetworkPage.',
  },
  {
    id: 'settings-menu',
    anchor: {
      kind: 'selectors',
      objects: [
        'SettingsSelectors.SettingsMenuBtn',
        'SettingsSelectors.SettingsMenuItem',
        'SettingsSelectors.SwitchAccountMenuItem',
        'SettingsSelectors.TogglePrivacy',
        'SettingsSelectors.LockListItem',
        'SettingsSelectors.SignOutListItem',
      ],
    },
    routes: [],
    startRoute: RouteUrls.Home,
    open: ['SettingsPage.openSettingsMenu'],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Click the header gear (SettingsSelectors.SettingsMenuBtn) on Home, on any screen with the page header, or on /unlock',
          'The dropdown opens over the current screen without changing the URL; Escape or clicking outside closes it',
        ],
      },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: SettingsSelectors.SettingsMenuItem,
      others: [
        SettingsSelectors.SwitchAccountMenuItem,
        SettingsSelectors.TogglePrivacy,
        SettingsSelectors.LockListItem,
        SettingsSelectors.SignOutListItem,
      ],
    },
    actions: [
      'SettingsPage.openSettingsMenu',
      'SettingsPage.openSettingsPage',
      'SettingsPage.openViewSecretKeyPage',
      'HomePage.clickSettingsButton',
      'HomePage.lock',
      'HomePage.signOut',
    ],
    specs: [
      settingsSpec,
      walletLockSpec,
      signOutMultiwalletSpec,
      signOutRecreateWalletSpec,
      passwordMemoryLeakSpec,
      allBalancesSpec,
      addNetworkSpec,
      sendBtcSpec,
      sendStxSpec,
      'apps/extension/tests/specs/onboarding/onboarding.spec.ts',
      'apps/extension/tests/specs/switch-account/multiwallet-integrity.spec.ts',
      'apps/extension/tests/specs/rpc-open/open.spec.ts',
      'apps/extension/tests/specs/rpc-get-addresses/get-addresses.spec.ts',
    ],
    description:
      'The header settings dropdown (features/settings/settings.tsx), mounted by the Home header, the page header and the unlock header; it is not a route. While unlocked it lists "Settings" (/settings), "Manage wallets" (opens the switch-account-sheet), "Toggle privacy" (a switch; the menu stays open), then "Lock" and "Sign out" (opens the sign-out-sheet). "Lock" shows when any software wallet is unlocked and is never offered in the unlock header; "Sign out" shows whenever keys exist. Holding Alt adds "Copy diagnostics to clipboard" and "Clear diagnostic information" (advanced-menu-items.tsx), which are not gated on the unlocked state. While locked only "Sign out" is left (plus the diagnostics items while Alt is held). "Lock" passes the current router path as the unlock from. SettingsPage.openSettingsMenu and HomePage.clickSettingsButton only click the gear and do not wait for the menu; HomePage.lock retries the click until the "Lock" item is visible. Summary pages replace the gear with a close button, and the page header hides the gear below the sm breakpoint on some screens.',
  },
  {
    id: 'sign-out-sheet',
    anchor: {
      kind: 'selectors',
      objects: [
        'SettingsSelectors.BtnSignOutActuallyDeleteWallet',
        'SettingsSelectors.BtnSignOutReturnToHomeScreen',
        'SettingsSelectors.SignOutConfirmHasBackupCheckbox',
        'SettingsSelectors.SignOutConfirmPasswordDisable',
      ],
    },
    routes: [],
    startRoute: RouteUrls.Home,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Open the header settings menu (SettingsPage.openSettingsMenu) and click "Sign out" (SettingsSelectors.SignOutListItem)',
          'Or on /settings click the sticky "Sign Out" button (same test id)',
        ],
      },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: SettingsSelectors.BtnSignOutActuallyDeleteWallet,
      others: [
        SettingsSelectors.BtnSignOutReturnToHomeScreen,
        SettingsSelectors.SignOutConfirmHasBackupCheckbox,
        SettingsSelectors.SignOutConfirmPasswordDisable,
      ],
    },
    actions: ['HomePage.signOut'],
    specs: [settingsSpec, walletLockSpec, signOutMultiwalletSpec, signOutRecreateWalletSpec],
    description:
      'The "Sign out" confirmation sheet (features/settings/sign-out/sign-out.tsx). No page-object action stops on it: HomePage.signOut opens it, ticks every box and signs out, so a repro opens the settings menu, clicks SignOutListItem and then waits for BtnSignOutActuallyDeleteWallet itself. HomePage.signOut always clicks the password checkbox, so it only works with at least one software wallet. It shows a warning callout ("You\'ll need your Secret Key to sign in again", or "Secret Keys" with several software wallets), one backup checkbox per software wallet labelled "I have backed up my Secret Key." for a single wallet or "I have backed up the Secret Key for <wallet name>." with several (sign-out.utils.ts), and a password checkbox ("I understand that my password will not give me access to my wallet after I sign out.", or "… my wallets after I sign out." with several software wallets). Each backup checkbox test id is SignOutConfirmHasBackupCheckbox suffixed with "-<fingerprint>", so match it by prefix ([data-testid^=…]) as HomePage does; getByTestId with the bare value matches nothing. With a Ledger-only wallet there are no backup checkboxes and the password checkbox is hidden and pre-ticked. "Sign out" (BtnSignOutActuallyDeleteWallet) stays disabled until every box is ticked, then clears storage and lands on /get-started; "Cancel" (BtnSignOutReturnToHomeScreen) closes the sheet. It also opens while the wallet is locked (wallet-lock.spec). sign-out-multiwallet.spec and sign-out-recreate-wallet.spec override the Stacks balance endpoints with inline page.route zero balances.',
  },
  {
    id: 'view-secret-key',
    anchor: { kind: 'route' },
    routes: [RouteUrls.ViewSecretKey],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: ['On /settings click "Secret Key" (SettingsSelectors.ViewSecretKeyListItem)'],
      },
      {
        kind: 'nav',
        steps: [
          'Or open the account switcher, click "Manage", open a wallet menu and pick "View Secret Key"',
        ],
      },
      { kind: 'deepLink', steps: ['Open #/view-secret-key with an unlocked wallet'] },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: SettingsSelectors.EnterPasswordInput,
      others: [
        SettingsSelectors.UnlockWalletBtn,
        SettingsSelectors.ShowSecretKeyBtn,
        SettingsSelectors.CopyKeyToClipboardBtn,
        OnboardingSelectors.BackUpSecretKeyBtn,
      ],
    },
    actions: [
      'SettingsPage.openViewSecretKeyPage',
      'HomePage.unlock',
      'SwitchAccountPage.viewSecretKey',
    ],
    specs: [
      settingsSpec,
      'apps/extension/tests/specs/switch-account/multiwallet.spec.ts',
      'apps/extension/tests/specs/switch-account/multiwallet-integrity.spec.ts',
    ],
    description:
      'Reveals a software wallet\'s Secret Key: the active wallet\'s by default, or the wallet whose fingerprint arrives in route state when opened from the account switcher\'s wallet menu (switch-account-sheet.tsx onViewSecretKey, unlocked-view-secret-key.tsx). The page first asks for the password (the same RequestPassword form as /unlock; a wrong password shows "The password you entered is invalid"). After a correct password it shows the words with a reveal toggle, a "Copy" button that reads "Copied!" once pressed, and "I\'ve backed it up" (BackUpSecretKeyBtn), which goes to the previous page. If the requested wallet\'s key is not in memory, the page goes to the previous page immediately. SettingsPage.openViewSecretKeyPage has no real readiness wait (isVisible() without a state).',
  },
  {
    id: 'select-theme',
    anchor: { kind: 'route' },
    routes: [RouteUrls.SelectTheme],
    params: [],
    entry: [
      { kind: 'nav', steps: ['On /settings click "Theme" (SettingsSelectors.ToggleTheme)'] },
      { kind: 'deepLink', steps: ['Open #/select-theme with an unlocked wallet'] },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: SharedComponentsSelectors.HeaderBackBtn,
      others: [],
    },
    actions: [],
    specs: [],
    description:
      'Picks the colour theme: Light, Dark or System. Selecting an item applies it immediately and tracks a select_theme event; the back button goes to the previous page (navigate(-1), so /settings when opened from there). No page-object action opens it: run SettingsPage.openSettingsPage, then click ToggleTheme. The theme rows carry no test ids, so a repro clicks them by text. No spec covers this screen.',
  },
  {
    id: 'wallet-lock',
    anchor: { kind: 'behavior' },
    routes: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Open the settings menu and click "Lock" (SettingsSelectors.LockListItem)',
          'Every open extension window reloads into the unlock screen; entering the password (unlock entry) restores the session',
        ],
      },
      {
        kind: 'nav',
        steps: [
          'Or on /settings click the sticky "Lock App" button (same test id); unlocking afterwards lands on Home (see unlock)',
        ],
      },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      others: [
        SettingsSelectors.LockListItem,
        SettingsSelectors.EnterPasswordInput,
        SettingsSelectors.CurrentAccountDisplayName,
      ],
    },
    actions: ['HomePage.lock', 'HomePage.unlock'],
    specs: [
      walletLockSpec,
      settingsSpec,
      passwordMemoryLeakSpec,
      'apps/extension/tests/specs/switch-account/multiwallet-integrity.spec.ts',
      'apps/extension/tests/specs/rpc-open/open.spec.ts',
      'apps/extension/tests/specs/rpc-get-addresses/get-addresses.spec.ts',
    ],
    description:
      'What locking does (useKeyActions.lockWallet in apps/extension/src/app/common/hooks/use-key-actions.ts): clear the wallet session in chrome.storage.session (the encryptionKey), the in-memory key store and the keychain selector caches, broadcast a wallet-lock message, call afterLock (both callers navigate to /unlock with a from route), then reload the window. Other open windows receive the message (useOnWalletLock in features/container/container.tsx), clear their in-memory keys and caches and reload, after which AccountGate shows /unlock; the window stays open (wallet-lock.spec). There is no idle timer: the wallet locks only on this action, on an extension update, or when the browser discards session storage. A locked wallet can still sign out from the settings menu. password-memory-leak.spec checks that the password is not left in the heap after locking.',
  },
] as const satisfies readonly ExtensionFeatureEntry[];
