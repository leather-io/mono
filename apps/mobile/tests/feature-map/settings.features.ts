import { AppRoutes } from '@/shared/app-routes';
import { HomeSelectors } from '@/shared/selectors/home.selectors';
import { SettingsSelectors } from '@/shared/selectors/settings.selectors';
import { SharedSelectors } from '@/shared/selectors/shared.selectors';

import type { MobileFeatureEntry } from './mobile-feature-entry';

const smokeTestsFlow = 'apps/mobile/maestro/flows/smoke-tests.yaml';
const smokeTestsCiFlow = 'apps/mobile/maestro/flows/smoke-tests-ci.yaml';
const openSettingsStep = 'On the Home tab tap the header gear (HomeSelectors.SettingsButton)';
const openDisplayStep = 'On Settings tap "Display" (SettingsSelectors.DisplayButton)';
const openSecurityStep = 'On Settings tap "Security" (SettingsSelectors.SecurityButton)';

export const settingsFeatures = [
  {
    id: 'settings',
    anchor: { kind: 'route' },
    routes: [AppRoutes.Settings],
    params: [],
    entry: [
      { kind: 'nav', steps: [openSettingsStep] },
      { kind: 'deepLink', steps: ['Open leather://settings'] },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: {
      ready: SettingsSelectors.WalletAndAccountsButton,
      others: [
        SettingsSelectors.DisplayButton,
        SettingsSelectors.SecurityButton,
        SettingsSelectors.NetworkButton,
        SettingsSelectors.AppIconButton,
        SettingsSelectors.HelpButton,
        SettingsSelectors.DeviceIdButton,
        SettingsSelectors.LockAppButton,
        SharedSelectors.BackButton,
        HomeSelectors.NetworkBadge,
      ],
    },
    actions: [],
    specs: [smokeTestsFlow, smokeTestsCiFlow],
    description:
      'The Settings screen (app/settings/index.tsx) inside features/settings/settings-layout.tsx, which renders a Screen.Header with the title as its centre element (Text variant label01 inside a FadingView driven by the header visibility), the default HeaderBackButton (SharedSelectors.BackButton: router.back() when it can go back, else navigate("/")) and the default NetworkBadge on the right, then the same title as Screen.Title (Text variant heading03, whose Marche font style in packages/tokens/src/typography.ts sets textTransform uppercase, so t`Settings` renders as "SETTINGS"). The screen reads no wallet state and renders the same with or without a wallet. Rows (components/settings/settings-list-item.tsx): "Wallets and accounts" / "Add, configure and remove" (WalletAndAccountsButton, navigates to /settings/wallet, settings-wallet entry), "Display" / "Theme and account identifier" (DisplayButton, settings-display), "Security" / "Analytics and app authentication" (SecurityButton, settings-security), "Networks" / "Mainnet, testnet or signet" (NetworkButton, settings-networks), "App Icon" / "Customize your app icon" (AppIconButton, presents the app icon sheet, settings-app-icon-sheet) and "Help" / "Get support or provide feedback" (HelpButton, settings-help). The "More options" accordion (MoreOptionsButton) renders only when useWaitlistFlag (release_waitlist_features) is on; its "Contacts" (ContactsButton) and "Fees" (FeesButton) items each present a NotifyUserSheetLayout (components/sheets/notify-user-sheet.layout.tsx) titled "Contacts" or "Custom fees" with "This feature is not available yet, but we can notify you when ready." and an "I\'m interested" button that tracks submit_feature_waitlist with the waitlist id and dismisses the sheet. Below it a "Version" line shows expo-application nativeApplicationVersion / nativeBuildVersion, and a "Device ID" block (DeviceIdButton, only once useDeviceId resolves an id) copies the id to the clipboard and shows a success toast "ID copied to clipboard" (SharedSelectors.ToastContainer). "Lock app" (LockAppButton) calls useAuthContext().lockApp, which dispatches lockManually in components/splash-screen-guard/use-auth-state.tsx: the SplashScreenGuard overlays the locked splash with an "Unlock" button that re-runs device authentication when securityLevelPreference is secure and otherwise replays the splash and unlocks without a prompt. NetworkBadge (HomeSelectors.NetworkBadge) shows only off mainnet. smoke-tests.yaml and smoke-tests-ci.yaml tap homeSettingsButton from Home and assert the text "SETTINGS"; smoke-tests-ci.yaml waits for "Add account" first, so it runs without a wallet.',
  },
  {
    id: 'settings-display',
    anchor: { kind: 'route' },
    routes: [AppRoutes.SettingsDisplay],
    params: [],
    entry: [
      { kind: 'nav', steps: [openSettingsStep, openDisplayStep] },
      { kind: 'deepLink', steps: ['Open leather://settings/display'] },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: {
      ready: SettingsSelectors.ThemeButton,
      others: [
        SettingsSelectors.ConversionUnitButton,
        SettingsSelectors.AccountIdentifierButton,
        SettingsSelectors.HapticsItem,
        SharedSelectors.BackButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'The "Display" settings screen (app/settings/display/index.tsx, in features/settings/settings-layout.tsx). Rows: "Theme" with the current preference as caption ("Light", "Dark" or "System"; ThemeButton, presents features/settings/theme-sheet.tsx, settings-theme-sheet), "Bitcoin unit" with the unit symbol (BitcoinUnitButton, presents bitcoin-unit-sheet.tsx, settings-bitcoin-unit-sheet) only when useBtcConversionUnitFlag (release_btc_conversion_unit_feature) is on, "Language" (presents language-sheet.tsx) only when useInternationalizationFlag (internationalization) is on and i18n/languages.ts lists more than one language, which it does not today (only "English"), so the row never renders, "Conversion unit" with the fiat currency symbol (ConversionUnitButton, presents conversion-unit-sheet.tsx, settings-conversion-unit-sheet), "Account identifier" with "Native Segwit address", "Taproot address", "BNS name" or "Stacks address" (AccountIdentifierButton, presents account-identifier-sheet.tsx, settings-account-identifier-sheet), and "Haptics" / "Toggle tactile feedback for interactions" (HapticsItem), a switch row whose Switch flips hapticsPreference between enabled and disabled; the row itself has no press handler. Each sheet uses features/settings/settings-sheet.layout.tsx (a Sheet with a sticky header title and, when given, a question-mark button that opens a guide URL in the Browser tab through useOpenUrl). All preferences live in the persisted settings slice (store/settings). The back button returns to Settings. Nothing covers this screen; legacy-flows/change-theme.yaml walked it by text ("Display Theme and account identifier", "Theme System", then "Light"/"Dark", then "DISPLAY" to dismiss) before it rotted.',
  },
  {
    id: 'settings-security',
    anchor: { kind: 'route' },
    routes: [AppRoutes.SettingsSecurity],
    params: [],
    entry: [
      { kind: 'nav', steps: [openSettingsStep, openSecurityStep] },
      { kind: 'deepLink', steps: ['Open leather://settings/security'] },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: {
      ready: SettingsSelectors.AnalyticsButton,
      others: [SettingsSelectors.AppAuthenticationButton, SharedSelectors.BackButton],
    },
    actions: [],
    specs: [],
    description:
      'The "Security" settings screen (app/settings/security/index.tsx). Rows: "Analytics" with caption "Enabled" when analyticsPreference is consent-given, else "Disabled" (AnalyticsButton, presents features/settings/analytics-sheet.tsx, settings-analytics-sheet), and "App authentication" with "Enabled" when securityLevelPreference is secure and "Disabled" for insecure or not-selected (AppAuthenticationButton, presents app-authentication-sheet.tsx, settings-app-authentication-sheet). Toggling device security runs useAuthentication().authenticate (hooks/use-authentication.ts): it checks expo-local-authentication enrolment and, with nothing enrolled, shows the error toast "App is not protected with device-level PIN or biometrics." and changes nothing; otherwise it prompts for biometrics or PIN and on success flips securityLevelPreference between secure and insecure in the persisted settings slice (store/settings). With secure, SplashScreenGuard asks for device authentication on cold start and after the app was backgrounded for more than 60 seconds (components/splash-screen-guard/use-auth-state.tsx). The account identifier sheet is not on this screen; it is presented from Display. Nothing covers this screen.',
  },
  {
    id: 'settings-networks',
    anchor: { kind: 'route' },
    routes: [AppRoutes.SettingsNetworks],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [openSettingsStep, 'On Settings tap "Networks" (SettingsSelectors.NetworkButton)'],
      },
      {
        kind: 'nav',
        steps: [
          'Off mainnet, tap the network badge (HomeSelectors.NetworkBadge) on Home or in any Screen.Header',
        ],
      },
      { kind: 'deepLink', steps: ['Open leather://settings/networks'] },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: {
      ready: SettingsSelectors.NetworkItem,
      others: [HomeSelectors.NetworkBadge, SharedSelectors.BackButton],
    },
    actions: [],
    specs: [],
    description:
      'The "Networks" settings screen (app/settings/networks/index.tsx): one radio row per defaultNetworkPreferences entry in store/settings/utils.ts, titled "Mainnet", "Testnet4" and "Signet" (capitalize of the id) with caption "Enabled" on the selected network and "Disabled" on the others. Each row\'s test id is SettingsSelectors.NetworkItem plus "-<id>" (settingsNetworkItem-mainnet, settingsNetworkItem-testnet4, settingsNetworkItem-signet). Tapping a row calls changeNetworkPreference, which stores the id as networkPreference in the settings slice (persisted through redux-persist to AsyncStorage, store/storage-persistors.ts) and shows the toast "Changed network"; the screen stays open. The default is mainnet. features/settings/network-badge.tsx (HomeSelectors.NetworkBadge) renders nothing on mainnet and otherwise a badge with the network name ("Testnet4", "Signet") that navigates here; it is the default right element of Screen.Header and is also mounted by components/home/home-without-account-screen.tsx, features/account/components/account-total-balance.tsx and the token and collectible screens (features/token/token.tsx, collectible.tsx). Nothing covers this screen; legacy-flows/change-network.yaml walked it by tapping "Testnet4 Disabled" and later "Mainnet Disabled" (the title and caption of the rows, which still render) and asserting the "Testnet4" badge.',
  },
  {
    id: 'settings-help',
    anchor: { kind: 'route' },
    routes: [AppRoutes.SettingsHelp],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [openSettingsStep, 'On Settings tap "Help" (SettingsSelectors.HelpButton)'],
      },
      { kind: 'deepLink', steps: ['Open leather://settings/help'] },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: {
      ready: SettingsSelectors.ContactUsButton,
      others: [
        SettingsSelectors.GuidesButton,
        SettingsSelectors.LearnButton,
        SharedSelectors.BackButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'The "Help" settings screen (app/settings/help/index.tsx). Rows: "Contact us" / "Get support or provide feedback" (ContactUsButton, LEATHER_SUPPORT_URL https://leather.io/contact), "Guides" / "Dive into feature details" (GuidesButton, LEATHER_GUIDES_URL https://app.leather.io/support) and "Learn" / "Expand your Bitcoin knowledge" (LearnButton, LEATHER_LEARN_URL https://leather.io/learn). Each calls useOpenUrl (features/browser/browser/use-open-url.ts), which dismisses any open modals and navigates to /browser?url=<url>, so the page opens in the in-app Browser tab, not an external browser. The pages load live from the network. Nothing covers this screen; legacy-flows/settings-guides.yaml, settings-learn.yaml and settings-support.yaml walked it by text that no longer exists in the sources ("Help Support, guides and articles", "Learn Expand your knowledge", "Support and feedback Contact our support team").',
  },
  {
    id: 'settings-theme-sheet',
    anchor: { kind: 'selectors', objects: ['SettingsSelectors.ThemeOption'] },
    routes: [],
    startRoute: AppRoutes.SettingsDisplay,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [openSettingsStep, openDisplayStep, 'Tap "Theme" (SettingsSelectors.ThemeButton)'],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: {
      ready: SettingsSelectors.ThemeOption,
      others: [SettingsSelectors.ThemeButton],
    },
    actions: [],
    specs: [],
    description:
      'The "Theme" sheet (features/settings/theme-sheet.tsx in settings-sheet.layout.tsx): radio rows "Light", "Dark" and "System" whose test ids are SettingsSelectors.ThemeOption plus "-light", "-dark" or "-system". Tapping a row calls changeThemePreference, which stores themePreference in the persisted settings slice, and shows the toast "Theme updated"; the handler does not dismiss the sheet. The Display row caption follows the selection. Default is system. Nothing covers it; legacy-flows/change-theme.yaml tapped "Light" and "Dark" by text.',
  },
  {
    id: 'settings-bitcoin-unit-sheet',
    anchor: { kind: 'selectors', objects: ['SettingsSelectors.BitcoinUnitOption'] },
    routes: [],
    startRoute: AppRoutes.SettingsDisplay,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          openSettingsStep,
          openDisplayStep,
          'Tap "Bitcoin unit" (SettingsSelectors.BitcoinUnitButton), shown only with release_btc_conversion_unit_feature on',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: ['release_btc_conversion_unit_feature'],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: {
      ready: SettingsSelectors.BitcoinUnitOption,
      others: [SettingsSelectors.BitcoinUnitButton],
    },
    actions: [],
    specs: [],
    description:
      'The "Bitcoin unit" sheet (features/settings/bitcoin-unit-sheet.tsx): radio rows for each bitcoinUnitsKeyedByName entry in @leather.io/constants, titled by symbol ("BTC", "sat") with the capitalised name as caption ("Bitcoin", "Satoshi"); test ids are SettingsSelectors.BitcoinUnitOption plus "-bitcoin" or "-satoshi". Tapping a row calls changeBitcoinUnitPreference (persisted settings slice) and shows the toast "Bitcoin unit updated". The header question-mark opens LEATHER_GUIDES_MOBILE_BITCOIN_UNIT (shared/constants.ts) in the Browser tab. The row that presents it renders only when useBtcConversionUnitFlag (release_btc_conversion_unit_feature) is on. Default is bitcoin. Nothing covers it.',
  },
  {
    id: 'settings-conversion-unit-sheet',
    anchor: { kind: 'selectors', objects: ['SettingsSelectors.ConversionUnitOption'] },
    routes: [],
    startRoute: AppRoutes.SettingsDisplay,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          openSettingsStep,
          openDisplayStep,
          'Tap "Conversion unit" (SettingsSelectors.ConversionUnitButton)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: {
      ready: SettingsSelectors.ConversionUnitOption,
      others: [SettingsSelectors.ConversionUnitButton],
    },
    actions: [],
    specs: [],
    description:
      'The "Conversion unit" sheet (features/settings/conversion-unit-sheet.tsx): one radio row per currencyNameMap entry in @leather.io/constants ("United States Dollar", "Euro", "British Pound", "Australian Dollar", "Canadian Dollar", "Chinese Yuan", "Japanese Yen", "South Korean Won", "Bitcoin") with the symbol as caption; test ids are SettingsSelectors.ConversionUnitOption plus "-<symbol>" (settingsConversionUnitOption-USD). Tapping a row calls changeQuoteCurrencyPreference, which stores fiatCurrencyPreference in the persisted settings slice, and shows the toast "Conversion unit updated". Default is USD. Nothing covers it.',
  },
  {
    id: 'settings-account-identifier-sheet',
    anchor: { kind: 'selectors', objects: ['SettingsSelectors.AccountIdentifierOption'] },
    routes: [],
    startRoute: AppRoutes.SettingsDisplay,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          openSettingsStep,
          openDisplayStep,
          'Tap "Account identifier" (SettingsSelectors.AccountIdentifierButton)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: {
      ready: SettingsSelectors.AccountIdentifierOption,
      others: [SettingsSelectors.AccountIdentifierButton],
    },
    actions: [],
    specs: [],
    description:
      'The "Account identifier" sheet (features/settings/account-identifier-sheet.tsx): radio rows "Native Segwit address", "Taproot address", "BNS name" and "Stacks address" (shared/display-preference.ts) with a chain label caption; test ids are SettingsSelectors.AccountIdentifierOption plus "-native-segwit", "-taproot", "-bns" or "-stacks". Tapping a row calls changeAccountDisplayPreference (persisted settings slice) and shows the toast "Account identifier updated". The header question-mark opens LEATHER_GUIDES_MOBILE_ACCOUNT_IDENTIFIER in the Browser tab. Default is native-segwit. Nothing covers it.',
  },
  {
    id: 'settings-app-icon-sheet',
    anchor: { kind: 'selectors', objects: ['SettingsSelectors.AppIconOption'] },
    routes: [],
    startRoute: AppRoutes.Settings,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [openSettingsStep, 'Tap "App Icon" (SettingsSelectors.AppIconButton)'],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: {
      ready: SettingsSelectors.AppIconOption,
      others: [SettingsSelectors.AppIconButton],
    },
    actions: [],
    specs: [],
    description:
      'The "App Icon" sheet (features/settings/choose-app-icon/app-icon-picker-sheet.tsx with app-icons.tsx and app-icon-button.tsx): a four-column grid of the appIcons in app-icon.utils.ts ("default" and "icon-1" to "icon-11", iOS and Android assets differ); each button\'s test id is SettingsSelectors.AppIconOption ("app-icon") plus "-<icon>" (app-icon-default, app-icon-3), and the current icon has a highlighted border. Tapping another icon stores appIconPreference in the persisted settings slice first, then calls expo-alternate-app-icons setAlternateAppIcon with null for default or "Icon<n>"; if that throws, the preference is rolled back and the error toast "Failed to change app icon" shows. Taps on the current icon or while a change is in flight are ignored. Opening and dismissing the sheet track app_icon_picker_sheet_opened and app_icon_picker_sheet_dismissed. Nothing covers it.',
  },
  {
    id: 'settings-app-authentication-sheet',
    anchor: { kind: 'selectors', objects: ['SettingsSelectors.AppAuthenticationSwitchItem'] },
    routes: [],
    startRoute: AppRoutes.SettingsSecurity,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          openSettingsStep,
          openSecurityStep,
          'Tap "App authentication" (SettingsSelectors.AppAuthenticationButton)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: {
      ready: SettingsSelectors.AppAuthenticationSwitchItem,
      others: [SettingsSelectors.AppAuthenticationButton],
    },
    actions: [],
    specs: [],
    description:
      'The "App authentication" sheet (features/settings/app-authentication-sheet.tsx): one switch row "App authentication" / "Require biometrics or PIN" (AppAuthenticationSwitchItem; the toggle is the Switch at the row\'s right edge, the row has no press handler), on when securityLevelPreference is secure. Toggling runs useAuthentication().authenticate (hooks/use-authentication.ts): with no device PIN or biometrics enrolled it shows the error toast "App is not protected with device-level PIN or biometrics." and nothing changes; a successful prompt flips securityLevelPreference between secure and insecure and shows "App authorization updated"; a failed or cancelled prompt shows "Failed to authenticate". The header question-mark opens LEATHER_GUIDES_MOBILE_APP_AUTHENTICATION in the Browser tab. Nothing covers it.',
  },
  {
    id: 'settings-analytics-sheet',
    anchor: { kind: 'selectors', objects: ['SettingsSelectors.AnalyticsSwitchItem'] },
    routes: [],
    startRoute: AppRoutes.SettingsSecurity,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          openSettingsStep,
          openSecurityStep,
          'Tap "Analytics" (SettingsSelectors.AnalyticsButton)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: {
      ready: SettingsSelectors.AnalyticsSwitchItem,
      others: [SettingsSelectors.AnalyticsButton],
    },
    actions: [],
    specs: [],
    description:
      'The "Analytics" sheet (features/settings/analytics-sheet.tsx): one switch row "Allow collection of data" / "Share anonymous usage details" (AnalyticsSwitchItem; the toggle is the Switch at the row\'s right edge), on when analyticsPreference is consent-given (the default). Toggling flips analyticsPreference between consent-given and rejects-tracking through changeAnalyticsPreference (persisted settings slice, also tracks user_setting_updated and identifies analytics_preference) and shows the toast "Analytics updated". The header question-mark opens LEATHER_GUIDES_MOBILE_ANALYTICS in the Browser tab. Nothing covers it.',
  },
] as const satisfies readonly MobileFeatureEntry[];
