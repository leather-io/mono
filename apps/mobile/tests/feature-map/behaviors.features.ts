import { AppRoutes } from '@/shared/app-routes';
import { AppUpdateSelectors } from '@/shared/selectors/app-update.selectors';
import { GlobalSheetSelectors } from '@/shared/selectors/global-sheets.selectors';
import { SettingsSelectors } from '@/shared/selectors/settings.selectors';
import { SharedSelectors } from '@/shared/selectors/shared.selectors';

import type { MobileFeatureEntry } from './mobile-feature-entry';

const unlockFlow = 'apps/mobile/maestro/shared/unlock.yaml';
const flattenKeychainsSpec =
  'apps/mobile/src/store/migrations/migrate-0-1-flatten-keychains.spec.ts';
const padFingerprintsSpec = 'apps/mobile/src/store/migrations/migrate-1-2-pad-fingerprints.spec.ts';

export const behaviorFeatures = [
  {
    id: 'app-lock',
    anchor: { kind: 'behavior' },
    routes: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Turn the preference to secure: Settings > "Security" (SettingsSelectors.SecurityButton) > "App authentication" (SettingsSelectors.AppAuthenticationButton) > switch (SettingsSelectors.AppAuthenticationSwitchItem), or "Enable device security" while creating a wallet',
          'Cold-start the app, or send it to the background for more than 60 s and bring it back, to get the device authentication prompt',
          'Or on Settings tap "Lock app" (SettingsSelectors.LockAppButton), then "Unlock" (SharedSelectors.UnlockButton) on the locked splash',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'locked', mocks: [] },
    selectors: {
      others: [SettingsSelectors.LockAppButton, SharedSelectors.UnlockButton],
    },
    actions: [unlockFlow],
    specs: [],
    description:
      'What locking does: SplashScreenGuard (components/splash-screen-guard/splash-screen-guard.tsx), mounted in the root layout around every screen, covers the app with a full-screen splash while the auth state is not unlocked: the "unlocked" animation for the cold-start, started and passed-on-first statuses, the "locked" one for failed and passed-afterwards, and only the failed status adds the "Unlock" button (SharedSelectors.UnlockButton); the cover lifts when the animation finishes, or at once after a quick foreground unlock (use-auth-state.tsx). Everything branches on settings.securityLevelPreference (\'not-selected\' initially, set to \'secure\' or \'insecure\' by createWallet and toggled by the App authentication switch, settings-app-authentication-sheet). A cold start with \'secure\' calls authenticate() (use-authentication.ts), which shows the error toast "App is not protected with device-level PIN or biometrics." and fails when the device has no PIN or biometrics, else runs the system prompt; success plays the splash and tracks app_unlocked, failure shows the locked splash with "Unlock". With \'insecure\' or \'not-selected\' every path bypasses the prompt and only replays the splash. In secure mode backgrounding (use-app-state.ts) covers the app and, only if it was unlocked, stores lastActive; foregrounding skips the prompt when lastActive is less than 60 s old (unlockTimeout), else it prompts again. Settings "Lock app" (SettingsSelectors.LockAppButton, shown with or without a wallet) sets the failed status and clears lastActive, so a quick background and foreground cannot skip the prompt; "Unlock" re-runs the device prompt when secure and otherwise unlocks with no prompt, so a manual lock without the secure preference is cosmetic. unlock.yaml types "hey" into the element labelled "Passcode field" and presses enter: it answers the iOS simulator passcode prompt, not an app element, so it only works while that prompt is up with the simulator passcode "hey"; clean-up.yaml runs it when "Passcode field" is visible, and nothing taps "Unlock".',
  },
  {
    id: 'store-migrations',
    anchor: { kind: 'behavior' },
    routes: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Add a wallet on a build whose persisted state is at version 0 or 1, install the current build over it and cold-start',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [flattenKeychainsSpec, padFingerprintsSpec],
    description:
      "The persisted store is at version 2 (store/storage-persistors.ts: redux-persist over AsyncStorage, key \"root\", autoMergeLevel2, whitelist wallets, accounts, keychains, settings and apps). The root layout renders PersistGate with no loading view, and the native splash stays up until rehydration finishes because SplashScreenGuard hides it in an effect inside the gate. Migration 0→1 (migrate-0-1-flatten-keychains.ts) merges the separate keychains.bitcoin and keychains.stacks entity states into one, adding chain: 'bitcoin' or 'stacks' to each entity with the bitcoin ids first. Migration 1→2 (migrate-1-2-pad-fingerprints.ts) left-pads fingerprints to 8 hex characters in keychain ids and descriptor prefixes, wallet ids, account ids, apps accountId and settings.currentAccount.fingerprint. Mnemonics in the secure store are not migrated: mnemonic-store.ts looks them up under both the unpadded and the padded key. On REHYDRATE settings-rehydration.ts merges the persisted settings over the defaults, keeps the default haptics, notifications and asset visibility when missing, re-detects the language unless the user picked one, and falls currentAccount back to the first persisted account. The two specs assert the flattened ids and chain field with the other keys untouched, and a full v1 state (fingerprint f25e8 becomes 000f25e8 everywhere, 24682ead unchanged) equal to the expected v2 state, also with currentAccount undefined.",
  },
  {
    id: 'deep-links',
    anchor: { kind: 'behavior' },
    routes: [],
    params: [],
    entry: [
      {
        kind: 'deepLink',
        steps: [
          'Open leather://settings (or any leather://<path> of an AppRoutes value)',
          'Open leather://browser?url=https://leather.io to load a page in the Browser tab',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description:
      'app.config.ts sets scheme: \'leather\' (iOS CFBundleURLSchemes leather and exp+leather); there are no Android intent filters and no associated domains since "fix(mobile): remove deep linking (#2349)" removed the connect.leather.io universal links and use-deep-links.ts. No app code handles incoming links (expo-linking and Linking appear only in outgoing calls), so a leather://<path> link resolves only through expo-router\'s file routes, still behind SplashScreenGuard. The Browser tab reads its url search param and loads it, so leather://browser?url=<url> opens a page; in-app code reaches it through use-open-url.ts, which dismisses any modals and navigates to /browser?url=<url> without encoding the url. Screens that read params or state a previous screen passes are marked deepLinkable: false on their own entries. smoke-tests-ci.yaml runs openLink: ${MAESTRO_DEEP_LINK_URL} and taps "Open" on the iOS confirmation; nothing in the repo sets that variable and expo-updates is not a dependency, so it is a build-loading URL, not a route, and no flow opens a leather:// route.',
  },
  {
    id: 'app-update-required-sheet',
    anchor: { kind: 'selectors', objects: ['AppUpdateSelectors'] },
    routes: [],
    startRoute: AppRoutes.Home,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Serve the LaunchDarkly string flag minimum_app_version with a version above the installed native version (for example "99.0.0") and start the app: VersionGuard presents the sheet over the current screen',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: ['minimum_app_version'],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: {
      ready: AppUpdateSelectors.UpdateButton,
      others: [AppUpdateSelectors.MaybeLaterButton],
    },
    actions: [],
    specs: [],
    description:
      'The "Get the latest version of the Leather app" sheet (app-update-required-sheet.tsx, rendered globally in the root layout), presented by VersionGuard (version-guard.tsx) whenever useVersionCheck reports needsUpdate. The hook compares the native application version with useMinimumAppVersion (useStringVariation(\'minimum_app_version\', \'\')): an empty flag skips the check, an invalid installed or minimum version (version-utils.ts accepts x.y or x.y.z) skips it and reports a Sentry warning tagged version_guard, otherwise an update is needed only when the installed version is strictly lower. The sheet reads "Update the app to get access to the latest features." beside the app-disabled sticker. The update button (AppUpdateSelectors.UpdateButton) reads "Update from App Store" on iOS and "Update from Google Play" on Android, disables itself while it opens the store listing, and shows the alert "Unable to Open Store" / "Unable to open app store. Please update the app manually from your device’s app store." when the URL cannot open. "Maybe later" (AppUpdateSelectors.MaybeLaterButton) dismisses it and VersionGuard re-presents only when the check result changes, so the update is not enforced. components/version-guard/README.md describes a full-screen update screen, unit specs and a min-version-enforcement.yaml flow that do not exist.',
  },
  {
    id: 'description-sheet',
    anchor: { kind: 'selectors', objects: ['GlobalSheetSelectors.DescriptionSheetTitle'] },
    routes: [],
    startRoute: AppRoutes.Home,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On the Home tab tap "Total balance" under the account header: title "Total balance"',
          'On the Home tab, Tokens list, tap "Available" (shown once the account has activity): title "Available balance"',
          'On the Home tab tap "Locked STX" (shown while the STX balance loads or is stacking): title "Locked"',
          'At the bottom of the Home Tokens list tap "Trending tokens" (shown when the trending query returns tokens): title "Trending tokens"',
          'On Settings > "Wallets and accounts" (SettingsSelectors.WalletAndAccountsButton), or in the account selector sheet opened from the Home account header (AccountSelectors.AccountHeader), tap "Portfolio": title "Portfolio"',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: { ready: GlobalSheetSelectors.DescriptionSheetTitle, others: [] },
    actions: [],
    specs: [],
    description:
      'The generic explainer sheet (features/settings/description-sheet.tsx, rendered once in the root layout on descriptionSheetRef): present({ title, data }) opens it with the title (GlobalSheetSelectors.DescriptionSheetTitle) and each item as a paragraph or a bullet with a bold lead-in; it has no buttons. Each caller is a label with a question or info icon and no testID: "Total balance" ("Your total tokens on chain. Includes both available and locked amounts."), "Available balance" ("Amount of tokens you can actually send or spend right now. We calculate it by taking your total balance and removing:" with the "Outbound balance:", "Locked Stacks balance:" and "Uneconomical balance:" bullets; rendered only once the account has activity), "Locked" ("Amount you’ve committed to stacking. You won’t be able to move or spend it until the stacking period ends."; the "Locked STX" label shows while the STX balance loads or is stacking), "Trending tokens" ("Tokens trending across the Stacks ecosystem, ranked by recent trading activity."; hidden when the query yields no rows) and "Portfolio" ("Your total tokens across all your accounts.", on settings-wallet when wallets exist and in the account-selector-sheet). Balances, stacking state and trending tokens are fetched live.',
  },
  {
    id: 'toasts',
    anchor: { kind: 'behavior' },
    routes: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On Settings tap the Device ID row (SettingsSelectors.DeviceIdButton): success toast "ID copied to clipboard"',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: { others: [SharedSelectors.ToastContainer] },
    actions: [],
    specs: [],
    description:
      "displayToast({ title, type }) from useToastContext (components/toast/toast-context.tsx) renders one Toast per ToastWrapper, with type 'success' (green check), 'error' (red triangle) or 'info' and the title as the only text. Each wrapper has a single slot: a new toast clears any pending hide timer, replaces the content, slides the pill (SharedSelectors.ToastContainer) in from the top and slides it back after 3000 ms (TOAST_OPEN_DURATION); an upward pan dismisses it early. Nothing renders before the first toast, but afterwards the container stays mounted off-screen because its data is never cleared. The root layout wraps SplashScreenGuard and the whole app in one wrapper, so lock-screen errors such as \"App is not protected with device-level PIN or biometrics.\" use it; sheet-navigation-container.tsx gives each sheet navigator its own wrapper, so toasts raised inside the send, receive, swap and ramp sheets show in the sheet's slot.",
  },
] as const satisfies readonly MobileFeatureEntry[];
