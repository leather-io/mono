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
      'The Settings screen (app/settings/index.tsx in settings-layout.tsx: the title as the header centre label and as a page title, the default back button (SharedSelectors.BackButton: back, or / without history) and the NetworkBadge (HomeSelectors.NetworkBadge, off mainnet only) on the right; the heading font sets textTransform uppercase, so t`Settings` renders as "SETTINGS"). It reads no wallet state and renders the same with or without a wallet. Rows (settings-list-item.tsx): "Wallets and accounts" / "Add, configure and remove" (WalletAndAccountsButton, navigates to /settings/wallet, settings-wallet), "Display" / "Theme and account identifier" (DisplayButton, settings-display), "Security" / "Analytics and app authentication" (SecurityButton, settings-security), "Networks" / "Mainnet, testnet or signet" (NetworkButton, settings-networks), "App Icon" / "Customize your app icon" (AppIconButton, presents the settings-app-icon-sheet) and "Help" / "Get support or provide feedback" (HelpButton, settings-help). The "More options" accordion renders only with release_waitlist_features (useWaitlistFlag) on; its "Contacts" and "Fees" items each present a notify-user sheet titled "Contacts" or "Custom fees" with "This feature is not available yet, but we can notify you when ready." and an "I\'m interested" button that tracks submit_feature_waitlist and dismisses. Below, a "Version" line shows the native application and build versions, and the "Device ID" block (DeviceIdButton, only once useDeviceId resolves) copies the id and toasts "ID copied to clipboard". "Lock app" (LockAppButton) locks the app (app-lock). smoke-tests.yaml and smoke-tests-ci.yaml tap the gear from Home and assert "SETTINGS"; smoke-tests-ci.yaml waits for "Add account" first, so it runs without a wallet.',
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
      'The "Display" settings screen (app/settings/display/index.tsx). Rows: "Theme" with the current preference as caption ("Light", "Dark" or "System"; ThemeButton, presents the settings-theme-sheet), "Bitcoin unit" with the unit symbol (BitcoinUnitButton, presents the settings-bitcoin-unit-sheet) only with release_btc_conversion_unit_feature (useBtcConversionUnitFlag) on, "Language" only with internationalization (useInternationalizationFlag) on and more than one language in i18n/languages.ts, which lists only "English", so the row never renders, "Conversion unit" with the fiat currency symbol (ConversionUnitButton, presents the settings-conversion-unit-sheet), "Account identifier" with "Native Segwit address", "Taproot address", "BNS name" or "Stacks address" (AccountIdentifierButton, presents the settings-account-identifier-sheet), and "Haptics" / "Toggle tactile feedback for interactions" (HapticsItem), a switch row whose Switch flips hapticsPreference; the row itself has no press handler. Each sheet uses settings-sheet.layout.tsx (a sticky header title and, when given, a question-mark button that opens a guide URL in the Browser tab). All preferences live in the persisted settings slice. Back returns to Settings. legacy-flows/change-theme.yaml walked it by text ("Display Theme and account identifier", "Theme System", then "Light" / "Dark").',
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
      'The "Security" settings screen (app/settings/security/index.tsx). Rows: "Analytics" with caption "Enabled" when analyticsPreference is consent-given, else "Disabled" (AnalyticsButton, presents the settings-analytics-sheet), and "App authentication" with "Enabled" when securityLevelPreference is secure and "Disabled" for insecure or not-selected (AppAuthenticationButton, presents the settings-app-authentication-sheet). Toggling device security runs authenticate (use-authentication.ts): with nothing enrolled it shows the error toast "App is not protected with device-level PIN or biometrics." and changes nothing; otherwise it prompts for biometrics or PIN and on success flips securityLevelPreference between secure and insecure. With secure, SplashScreenGuard asks for device authentication on cold start and after more than 60 s in the background (app-lock). The account identifier sheet is presented from Display, not here.',
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
      'The "Networks" settings screen (app/settings/networks/index.tsx): one radio row per default network preference, titled "Mainnet", "Testnet4" and "Signet" with caption "Enabled" on the selected network and "Disabled" on the others; each row\'s test id is SettingsSelectors.NetworkItem plus "-<id>" (settingsNetworkItem-mainnet, settingsNetworkItem-testnet4, settingsNetworkItem-signet). Tapping a row stores the id as networkPreference in the persisted settings slice and shows the toast "Changed network"; the screen stays open. The default is mainnet. The NetworkBadge (network-badge.tsx, HomeSelectors.NetworkBadge) renders nothing on mainnet and otherwise a badge with the network name ("Testnet4", "Signet") that navigates here; it is the default right element of Screen.Header and is also mounted by the home-no-wallet header, the total balance row and the token and collectible screens. legacy-flows/change-network.yaml walked it by tapping "Testnet4 Disabled" and later "Mainnet Disabled" (the title and caption of the rows, which still render) and asserting the "Testnet4" badge.',
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
      'The "Help" settings screen (app/settings/help/index.tsx). Rows: "Contact us" / "Get support or provide feedback" (ContactUsButton, https://leather.io/contact), "Guides" / "Dive into feature details" (GuidesButton, https://app.leather.io/support) and "Learn" / "Expand your Bitcoin knowledge" (LearnButton, https://leather.io/learn). Each calls useOpenUrl, which dismisses any open modals and navigates to /browser?url=<url>, so the page opens in the in-app Browser tab, not an external browser. The pages load live. legacy-flows/settings-guides.yaml, settings-learn.yaml and settings-support.yaml walked it by text that no longer exists in the sources.',
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
      'The "Theme" sheet (features/settings/theme-sheet.tsx): radio rows "Light", "Dark" and "System" whose test ids are SettingsSelectors.ThemeOption plus "-light", "-dark" or "-system". Tapping a row stores themePreference in the persisted settings slice and shows the toast "Theme updated"; the sheet stays open. The Display row caption follows the selection. Default is system. legacy-flows/change-theme.yaml tapped "Light" and "Dark" by text.',
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
      'The "Bitcoin unit" sheet (features/settings/bitcoin-unit-sheet.tsx): radio rows for each bitcoin unit in @leather.io/constants, titled by symbol ("BTC", "sat") with the capitalised name as caption ("Bitcoin", "Satoshi"); test ids are SettingsSelectors.BitcoinUnitOption plus "-bitcoin" or "-satoshi". Tapping a row stores the unit preference and shows the toast "Bitcoin unit updated". The header question-mark opens the Bitcoin unit guide in the Browser tab. The row that presents it renders only with release_btc_conversion_unit_feature (useBtcConversionUnitFlag) on. Default is bitcoin.',
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
      'The "Conversion unit" sheet (features/settings/conversion-unit-sheet.tsx): one radio row per currency in @leather.io/constants ("United States Dollar", "Euro", "British Pound", "Australian Dollar", "Canadian Dollar", "Chinese Yuan", "Japanese Yen", "South Korean Won", "Bitcoin") with the symbol as caption; test ids are SettingsSelectors.ConversionUnitOption plus "-<symbol>" (settingsConversionUnitOption-USD). Tapping a row stores fiatCurrencyPreference and shows the toast "Conversion unit updated". Default is USD.',
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
      'The "Account identifier" sheet (features/settings/account-identifier-sheet.tsx): radio rows "Native Segwit address", "Taproot address", "BNS name" and "Stacks address" with a chain label caption; test ids are SettingsSelectors.AccountIdentifierOption plus "-native-segwit", "-taproot", "-bns" or "-stacks". Tapping a row stores the account display preference and shows the toast "Account identifier updated". The header question-mark opens the account identifier guide in the Browser tab. Default is native-segwit.',
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
      'The "App Icon" sheet (features/settings/choose-app-icon/app-icon-picker-sheet.tsx): a four-column grid of the app icons ("default" and "icon-1" to "icon-11"; iOS and Android assets differ); each button\'s test id is SettingsSelectors.AppIconOption plus "-<icon>" (app-icon-default, app-icon-3), and the current icon has a highlighted border. Tapping another icon stores appIconPreference first, then calls expo-alternate-app-icons; if that throws, the preference is rolled back and the error toast "Failed to change app icon" shows. Taps on the current icon or while a change is in flight are ignored. Opening and dismissing track app_icon_picker_sheet_opened and app_icon_picker_sheet_dismissed.',
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
      'The "App authentication" sheet (features/settings/app-authentication-sheet.tsx): one switch row "App authentication" / "Require biometrics or PIN" (AppAuthenticationSwitchItem; the toggle is the Switch at the row\'s right edge, the row has no press handler), on when securityLevelPreference is secure. Toggling runs authenticate (use-authentication.ts): with no device PIN or biometrics enrolled it shows the error toast "App is not protected with device-level PIN or biometrics." and nothing changes; a successful prompt flips securityLevelPreference between secure and insecure and shows "App authorization updated"; a failed or cancelled prompt shows "Failed to authenticate". The header question-mark opens the app authentication guide in the Browser tab.',
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
      'The "Analytics" sheet (features/settings/analytics-sheet.tsx): one switch row "Allow collection of data" / "Share anonymous usage details" (AnalyticsSwitchItem; the toggle is the Switch at the row\'s right edge), on when analyticsPreference is consent-given (the default). Toggling flips analyticsPreference between consent-given and rejects-tracking (which also tracks user_setting_updated) and shows the toast "Analytics updated". The header question-mark opens the analytics guide in the Browser tab.',
  },
] as const satisfies readonly MobileFeatureEntry[];
