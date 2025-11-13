import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';

import { AvailableLanguageCode, defaultLanguage } from '@/i18n/languages';
import { analytics } from '@/utils/analytics';
import { whenTheme } from '@/utils/when-theme';

import {
  AccountDisplayPreference,
  AnalyticsPreference,
  BitcoinUnit,
  DefaultNetworkConfigurations,
  QuoteCurrency,
  WalletDefaultNetworkConfigurationIds,
} from '@leather.io/models';
import { SerializedCryptoAssetId } from '@leather.io/utils';

import { useAppDispatch } from '../utils';
import {
  selectAccountDisplayPreference,
  selectAnalyticsPreference,
  selectAppIconPreference,
  selectAssetVisibility,
  selectBitcoinUnitPreference,
  selectCurrencyPreference,
  selectCurrentAccount,
  selectEmailAddressPreference,
  selectHapticsPreference,
  selectLanguagePreference,
  selectLanguagePreferenceSource,
  selectLastActive,
  selectNetworkPreference,
  selectNotificationsPreference,
  selectPrivacyModePreference,
  selectSecurityLevelPreference,
  selectThemePreference,
} from './settings.read';
import {
  userChangedAccountDisplayPreference,
  userChangedAnalyticsPreference,
  userChangedAppIconPreference,
  userChangedAssetVisibility,
  userChangedBitcoinUnitPreference,
  userChangedCurrentAccount,
  userChangedEmailAddressPreference,
  userChangedHapticsPreference,
  userChangedLanguagePreference,
  userChangedLanguagePreferenceSource,
  userChangedLastActive,
  userChangedNetworkPreference,
  userChangedNotificationPreference,
  userChangedPrivacyModePreference,
  userChangedQuoteCurrencyPreference,
  userChangedSecurityLevelPreference,
  userChangedThemePreference,
} from './settings.write';
import {
  AppIconPreference,
  CurrentAccount,
  HapticsPreference,
  LanguagePreferenceSource,
  LastActiveTimestamp,
  NotificationsPreference,
  PrivacyModePreference,
  SecurityLevelPreference,
  SettingsState,
  ThemePreference,
} from './utils';

export const initialState: SettingsState = {
  accountDisplayPreference: 'native-segwit',
  analyticsPreference: 'consent-given',
  bitcoinUnitPreference: 'bitcoin',
  createdOn: new Date().toISOString(),
  emailAddressPreference: '',
  fiatCurrencyPreference: 'USD', // TODO LEA-2723: migrate to quoteCurrencyPreference
  networkPreference: WalletDefaultNetworkConfigurationIds.mainnet,
  privacyModePreference: 'visible',
  hapticsPreference: 'enabled',
  securityLevelPreference: 'not-selected',
  themePreference: 'system',
  lastActive: null,
  notificationsPreference: 'not-selected',
  languagePreference: defaultLanguage,
  languagePreferenceSource: 'system',
  assetVisibility: {},
  currentAccount: null,
  appIconPreference: 'default',
};

export function useSettings() {
  const dispatch = useAppDispatch();
  const systemTheme = useColorScheme();

  const accountDisplayPreference = useSelector(selectAccountDisplayPreference);
  const analyticsPreference = useSelector(selectAnalyticsPreference);
  const bitcoinUnitPreference = useSelector(selectBitcoinUnitPreference);
  const emailAddressPreference = useSelector(selectEmailAddressPreference);
  const fiatCurrencyPreference = useSelector(selectCurrencyPreference);
  const privacyModePreference = useSelector(selectPrivacyModePreference);
  const hapticsPreference = useSelector(selectHapticsPreference);
  const networkPreference = useSelector(selectNetworkPreference);
  const securityLevelPreference = useSelector(selectSecurityLevelPreference);
  const themePreference = useSelector(selectThemePreference);
  const lastActive = useSelector(selectLastActive);
  const notificationsPreference = useSelector(selectNotificationsPreference);
  const languagePreference = useSelector(selectLanguagePreference);
  const languagePreferenceSource = useSelector(selectLanguagePreferenceSource);
  const assetVisibility = useSelector(selectAssetVisibility);
  const currentAccount = useSelector(selectCurrentAccount);
  const appIconPreference = useSelector(selectAppIconPreference);

  const themeDerivedFromThemePreference =
    (themePreference === 'system' ? systemTheme : themePreference) ?? 'light';

  return {
    accountDisplayPreference,
    analyticsPreference,
    bitcoinUnitPreference,
    emailAddressPreference,
    fiatCurrencyPreference,
    networkPreference,
    privacyModePreference,
    hapticsPreference,
    themeDerivedFromThemePreference,
    themePreference,
    securityLevelPreference,
    lastActive,
    notificationsPreference,
    languagePreference,
    languagePreferenceSource,
    assetVisibility,
    currentAccount,
    appIconPreference,
    whenTheme: whenTheme(themeDerivedFromThemePreference),
    changeCurrentAccount(account: CurrentAccount) {
      dispatch(userChangedCurrentAccount({ account }));
    },
    changeAssetVisibility(assetId: SerializedCryptoAssetId, value: boolean) {
      dispatch(userChangedAssetVisibility({ assetId, value }));
    },
    changeAppIconPreference(icon: AppIconPreference) {
      dispatch(userChangedAppIconPreference(icon));
      analytics.track('user_setting_updated', {
        app_icon: icon,
      });
    },
    changeAccountDisplayPreference(type: AccountDisplayPreference) {
      dispatch(userChangedAccountDisplayPreference(type));
      analytics.track('user_setting_updated', {
        account_display: type,
      });
    },
    changeAnalyticsPreference(pref: AnalyticsPreference) {
      dispatch(userChangedAnalyticsPreference(pref));
      analytics.track('user_setting_updated', {
        analytics: pref,
      });
      void analytics?.identify(undefined, {
        analytics_preference: pref,
      });
    },
    changeBitcoinUnitPreference(unit: BitcoinUnit) {
      dispatch(userChangedBitcoinUnitPreference(unit));
      analytics.track('user_setting_updated', {
        bitcoin_unit: unit,
      });
    },
    changeEmailAddressPreference(address: string) {
      dispatch(userChangedEmailAddressPreference(address));
      analytics.track('user_setting_updated', {
        email_address: address,
      });
      void analytics?.identify(undefined, {
        has_email_address: !!address,
      });
    },
    changeQuoteCurrencyPreference(unit: QuoteCurrency) {
      analytics.track('user_setting_updated', {
        quote_currency: unit,
      });
      dispatch(userChangedQuoteCurrencyPreference(unit));
    },
    changeNetworkPreference(network: DefaultNetworkConfigurations) {
      dispatch(userChangedNetworkPreference(network));
      analytics.track('user_setting_updated', {
        network,
      });
    },
    changePrivacyModePreference(mode: PrivacyModePreference) {
      dispatch(userChangedPrivacyModePreference(mode));
      analytics.track('user_setting_updated', {
        privacy_mode: mode,
      });
    },
    changeHapticsPreference(state: HapticsPreference) {
      dispatch(userChangedHapticsPreference(state));
      analytics.track('user_setting_updated', {
        haptics: state,
      });
    },
    changeSecurityLevelPreference(level: SecurityLevelPreference) {
      dispatch(userChangedSecurityLevelPreference(level));
      analytics.track('user_setting_updated', {
        security_level: level,
      });
    },
    changeThemePreference(theme: ThemePreference) {
      dispatch(userChangedThemePreference(theme));
      analytics.track('user_setting_updated', {
        theme,
      });
    },
    changeNotificationsPreference(state: NotificationsPreference) {
      dispatch(userChangedNotificationPreference(state));
      analytics.track('user_setting_updated', {
        notifications: state,
      });
    },
    changeLanguagePreference(language: AvailableLanguageCode) {
      dispatch(userChangedLanguagePreference(language));
      analytics?.track('user_setting_updated', {
        language,
      });
    },
    changeLanguagePreferenceSource(source: LanguagePreferenceSource) {
      dispatch(userChangedLanguagePreferenceSource(source));
    },
    userLeavesApp(timestamp: LastActiveTimestamp) {
      dispatch(userChangedLastActive(timestamp));
    },

    // TODO: Remove when live, debug only
    // ?? ask Fara about this - did we plan to not release testnet?
    toggleNetwork() {
      const network =
        networkPreference.chain.bitcoin.bitcoinNetwork === 'mainnet' ? 'testnet' : 'mainnet';
      dispatch(userChangedNetworkPreference(network));
      void analytics?.identify(undefined, {
        active_network: network,
      });
      analytics.track('user_setting_updated', {
        network,
      });
    },
    toggleTheme() {
      const theme = themeDerivedFromThemePreference === 'light' ? 'dark' : 'light';
      dispatch(userChangedThemePreference(theme));
      analytics.track('user_setting_updated', {
        theme,
      });
      void analytics?.identify(undefined, {
        active_theme: theme,
      });
    },
  };
}
