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
      'The app lock is SplashScreenGuard (components/splash-screen-guard/splash-screen-guard.tsx), mounted in app/_layout.tsx around every screen, with its state machine in use-auth-state.tsx and the lockApp context in use-auth-context.ts. While authState.isUnlocked is false it covers the app with a full-screen Box (zIndex max) playing the LeatherSplash: the "unlocked" animation for the cold-start, started and passed-on-first statuses, the "locked" one for failed and passed-afterwards; only the failed status adds the "Unlock" button (SharedSelectors.UnlockButton). The cover goes away when the splash animation finishes (onFinishAnimation), except after a quick foreground unlock, which sets isUnlocked at once. Everything branches on settings.securityLevelPreference (store/settings: \'not-selected\' initially, set to \'secure\' or \'insecure\' by createWallet in hooks/use-create-wallet.ts and toggled by the App authentication switch, settings-app-authentication-sheet entry). Cold start with \'secure\': unlockOnOpen calls authenticate() from hooks/use-authentication.ts, which shows the error toast "App is not protected with device-level PIN or biometrics." and fails when expo-local-authentication reports SecurityLevel.NONE, else runs LocalAuthentication.authenticateAsync; success plays the splash, sets passed-on-first and tracks app_unlocked, failure sets failed (locked splash plus "Unlock"). With \'insecure\' or \'not-selected\' every path calls bypassSecurity and replays the splash with no prompt. Background and foreground come from hooks/use-app-state.ts: on iOS foreground is background→active and background is inactive→background; on Android any change to active is foreground and any change to inactive or background is background. In secure mode backgrounding sets status started behind the cover and, only if the app was unlocked (passed-on-first or passed-afterwards), stores lastActive = now (userLeavesApp, persisted with settings); foregrounding skips the prompt when the status is not cold-start and lastActive is less than 60 s old (unlockTimeout = 60 * 1000), else it re-runs unlockOnOpen. Settings "Lock app" (SettingsSelectors.LockAppButton, app/settings/index.tsx, shown with or without a wallet) calls lockManually: status failed, lastActive cleared (so a quick background/foreground cannot skip the prompt) and app_locked tracked. "Unlock" re-runs the device prompt (passed-afterwards and app_unlocked on success, failed again otherwise) when secure, and otherwise unlocks with no prompt, so a manual lock without the secure preference is cosmetic. apps/mobile/maestro/shared/unlock.yaml taps the element labelled "Passcode field", types "hey" and presses enter: it answers the iOS simulator passcode prompt that authenticateAsync raises (no app source renders "Passcode field"), so it unlocks only when that prompt is up and the simulator passcode is "hey"; clean-up.yaml runs it when "Passcode field" is visible. It never taps "Unlock". No spec covers the lock; settings.read.spec.ts only tests getStacksNetworkFromNetworkConfig.',
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
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [flattenKeychainsSpec, padFingerprintsSpec],
    description:
      "Persisted state is redux-persist over AsyncStorage (store/storage-persistors.ts persistConfig: key \"root\", version 2, stateReconciler autoMergeLevel2, whitelist wallets, accounts, keychains, settings and apps, migrate = createMigrate(migrations) with debug logging in development). store/index.ts combines those five slices under persistReducer and starts persistStore; app/_layout.tsx renders PersistGate with loading={null}, and since SplashScreen.preventAutoHideAsync runs at module load while hideAsync runs in an effect of SplashScreenGuard (inside the gate), the native splash stays up until rehydration finishes. store/migrations/index.ts maps version 1 to migrate-0-1-flatten-keychains.ts, which merges the separate keychains.bitcoin and keychains.stacks entity states into one, adding chain: 'bitcoin' or 'stacks' to each entity with the bitcoin ids first, and version 2 to migrate-1-2-pad-fingerprints.ts, which left-pads fingerprints with zeros to 8 hex characters in keychain ids and the [fingerprint/...] prefix of descriptors, wallet ids and fingerprints, account ids, apps accountId and settings.currentAccount.fingerprint. Mnemonics in the secure store are not migrated: store/secure-store/mnemonic-store.ts looks them up under both the unpadded (v1) and padded (v2) keys from secure-store-keys.ts. On REHYDRATE, store/settings/settings-rehydration.ts merges the persisted settings over the defaults, keeps the default hapticsPreference, notificationsPreference and assetVisibility when missing, re-detects the language unless languagePreferenceSource is 'user-selection', and falls back currentAccount to the first persisted account id. migrate-0-1-flatten-keychains.spec.ts asserts the flattened ids and entities, the added chain field, that other state keys are untouched, the bitcoin-then-stacks id order and the empty-chain cases; migrate-1-2-pad-fingerprints.spec.ts asserts a full v1 state (fingerprint f25e8 becomes 000f25e8 everywhere, 24682ead unchanged) equals the expected v2 state, also with currentAccount undefined.",
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
      "app.config.ts sets scheme: 'leather' and an iOS infoPlist CFBundleURLTypes with CFBundleURLSchemes ['leather', 'exp+leather']; there are no Android intentFilters and no associated domains, since \"fix(mobile): remove deep linking (#2349)\" deleted the connect.leather.io app and universal links and hooks/use-deep-links.ts. No app code handles incoming links: grep for expo-linking and Linking. in apps/mobile/src finds only outgoing calls (Linking.openURL in features/browser/browser/browser.tsx for non-http URLs the web view meets, utils/app-store-utils.ts, components/external-link.tsx and the swap submission overlay, Linking.openSettings in the QR scanner permission hook), so a leather://<path> link resolves only through expo-router's file routes, still behind SplashScreenGuard. app/_layout.tsx exports unstable_settings = { initialRouteName: '/' }. app/(tabs)/browser.tsx reads the url search param, tracks in_app_browser_opened and loads it, so leather://browser?url=<url> opens a page; in-app code reaches it through features/browser/browser/use-open-url.ts, which dismisses any modals when router.canDismiss() and navigates to /browser?url=<url> without encoding the url. Screens that read params or state a previous screen passes are marked deepLinkable: false on their own entries. apps/mobile/maestro/flows/smoke-tests-ci.yaml launches the app, waits for animations, runs openLink: ${MAESTRO_DEEP_LINK_URL} (commented \"Then open the deep link to load EAS Update\"), taps \"Open\" on the iOS confirmation if shown, then waits 30 s for \"Add account\"; nothing in the repo sets MAESTRO_DEEP_LINK_URL and expo-updates is not a dependency (expo-dev-client is), so that link is a build-loading URL, not a route, and the flow is not cited as a deep-link spec. No flow opens a leather:// route.",
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
      'components/version-guard/version-guard.tsx, rendered at the top of App in app/_layout.tsx, presents versionGuardSheetRef whenever useVersionCheck (hooks/use-version-check.ts) reports needsUpdate. The hook compares expo-application nativeApplicationVersion with useMinimumAppVersion (features/feature-flags/index.ts, useStringVariation(\'minimum_app_version\', \'\')): an empty or blank flag skips the check; a missing or invalid current version or an invalid minimum (utils/version-utils.ts accepts x.y or x.y.z with numeric parts) also skips it and returns an error that VersionGuard sends to Sentry as a warning tagged version_guard; otherwise isVersionLessThan compares major, then minor, then patch (x.y counts as x.y.0) and needs an update only when the installed version is strictly lower. The sheet (components/app-update-required/app-update-required-sheet.tsx, rendered globally in app/_layout.tsx) reads "Get the latest version of the Leather app" and "Update the app to get access to the latest features." beside the app-disabled sticker. UpdateButton (update-button.tsx, AppUpdateSelectors.UpdateButton, value update-app-button) reads getStoreButtonText() from utils/app-store-utils.ts: "Update from App Store" on iOS, "Update from Google Play" on Android; it disables itself while handleStoreRedirect opens https://apps.apple.com/us/app/leather-self-custody-wallet/id6499127775 or https://play.google.com/store/apps/details?id=io.leather.mobilewallet, and when Linking.canOpenURL fails it shows the alert "Unable to Open Store" with "Unable to open app store. Please update the app manually from your device’s app store." and "OK". "Maybe later" (AppUpdateSelectors.MaybeLaterButton) dismisses the sheet; VersionGuard re-presents only when needsUpdate, isLoading or error change, so it stays away until the flag changes or the app restarts. The update is not enforced: once dismissed the app keeps working. components/version-guard/README.md describes a full-screen update screen, unit specs and a maestro/flows/min-version-enforcement.yaml flow that do not exist; nothing covers the sheet.',
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
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: { ready: GlobalSheetSelectors.DescriptionSheetTitle, others: [] },
    actions: [],
    specs: [],
    description:
      'features/settings/description-sheet.tsx, rendered once in app/_layout.tsx and exposed as descriptionSheetRef by core/global-sheet-provider.tsx, is a generic explainer: present({ title, data }) stores the content and opens the sheet, which shows the title (Sheet.Title, GlobalSheetSelectors.DescriptionSheetTitle) and then each item as a body paragraph or as a bullet with a bold lead-in. It has no buttons of its own. Callers, each a label with a question or info icon and no testID: features/account/components/account-total-balance.tsx ("Total balance": "Your total tokens on chain. Includes both available and locked amounts."), available-account-balance.tsx ("Available balance": "Amount of tokens you can actually send or spend right now. We calculate it by taking your total balance and removing:" with bullets "Outbound balance:" "funds already on their way to someone else.", "Locked Stacks balance:" "funds temporarily locked in a stacking pool and not yet spendable." and "Uneconomical balance:" "tiny amounts that cost more to send than they’re worth."; components/home/home-with-account-screen.tsx renders it only when the learning sections are hidden, that is unless activity loaded empty), account-stacking.tsx ("Locked": "Amount you’ve committed to stacking. You won’t be able to move or spend it until the stacking period ends."; the "Locked STX" label renders while the STX balance loads and when it is stacking), components/home/components/trending-tokens.tsx ("Trending tokens": "Tokens trending across the Stacks ecosystem, ranked by recent trading activity."; hidden when the query yields no rows) and portfolio-header.tsx ("Portfolio": "Your total tokens across all your accounts.", on app/settings/wallet/index.tsx when wallets exist and in the account selector sheet). Balances, stacking state and trending tokens are fetched live. No spec covers it.',
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
      "components/toast/toast-context.tsx provides displayToast({ title, type }) through ToastWrapper, which renders its children and one Toast (components/toast/index.tsx); useToastContext throws outside a wrapper. types.ts allows type 'success' (green CheckmarkCircleIcon), 'error' (red ErrorTriangleIcon) and 'info' (InfoCircleIcon), with the title as the only text. Each wrapper has a single slot: display clears any pending hide timer, replaces the content, slides the pill (SharedSelectors.ToastContainer) from translateY -100 to 72 and slides it back after 3000 ms (TOAST_OPEN_DURATION); an upward pan dismisses it early. Nothing renders before the first toast, but afterwards the toastContainer element stays mounted off-screen at -100 because its data is never cleared. Placements: app/_layout.tsx wraps SplashScreenGuard and the whole app in the root ToastWrapper, so lock-screen errors such as \"App is not protected with device-level PIN or biometrics.\" use it; core/sheet-navigation-container.tsx wraps each sheet navigator in its own ToastWrapper, used by the send, receive, swap and ramp sheets (features/send/send-sheet.tsx, send.tsx, features/receive/receive-sheet.tsx, receive.tsx, features/swap/swap-sheet.tsx, features/ramp/ramp-sheet.tsx), so toasts raised inside those sheets show in the sheet's slot. No spec covers toasts; legacy-flows/hide-account.yaml asserted toastContainer not visible right after running ../shared/add-wallet.yaml, a sub-flow that no longer exists.",
  },
] as const satisfies readonly MobileFeatureEntry[];
