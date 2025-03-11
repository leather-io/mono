import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';

import { analytics } from '@/utils/analytics';
import { whenTheme } from '@/utils/when-theme';

import {
  AccountDisplayPreference,
  AnalyticsPreference,
  BitcoinUnit,
  DefaultNetworkConfigurations,
  FiatCurrency,
  WalletDefaultNetworkConfigurationIds,
} from '@leather.io/models';

import { useAppDispatch } from '../utils';
import {
  selectAccountDisplayPreference,
  selectAnalyticsPreference,
  selectBitcoinUnitPreference,
  selectCurrencyPreference,
  selectEmailAddressPreference,
  selectHapticsPreference,
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
  userChangedBitcoinUnitPreference,
  userChangedEmailAddressPreference,
  userChangedFiatCurrencyPreference,
  userChangedHapticsPreference,
  userChangedLastActive,
  userChangedNetworkPreference,
  userChangedNotificationPreference,
  userChangedPrivacyModePreference,
  userChangedSecurityLevelPreference,
  userChangedThemePreference,
} from './settings.write';
import {
  HapticsPreference,
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
  fiatCurrencyPreference: 'USD',
  networkPreference: WalletDefaultNetworkConfigurationIds.mainnet,
  privacyModePreference: 'visible',
  hapticsPreference: 'enabled',
  securityLevelPreference: 'not-selected',
  themePreference: 'system',
  lastActive: null,
  notificationsPreference: 'not-selected',
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
    whenTheme: whenTheme(themeDerivedFromThemePreference),
    changeAccountDisplayPreference(type: AccountDisplayPreference) {
      dispatch(userChangedAccountDisplayPreference(type));
      void analytics?.track('user_setting_updated', {
        account_display: type,
      });
    },
    changeAnalyticsPreference(pref: AnalyticsPreference) {
      dispatch(userChangedAnalyticsPreference(pref));
      void analytics?.track('user_setting_updated', {
        analytics: pref,
      });
      void analytics?.identify(undefined, {
        analytics_preference: pref,
      });
    },
    changeBitcoinUnitPreference(unit: BitcoinUnit) {
      dispatch(userChangedBitcoinUnitPreference(unit));
      void analytics?.track('user_setting_updated', {
        bitcoin_unit: unit,
      });
    },
    changeEmailAddressPreference(address: string) {
      dispatch(userChangedEmailAddressPreference(address));
      void analytics?.track('user_setting_updated', {
        email_address: address,
      });
      void analytics?.identify(undefined, {
        has_email_address: !!address,
      });
    },
    changeFiatCurrencyPreference(unit: FiatCurrency) {
      void analytics?.track('user_setting_updated', {
        fiat_currency: unit,
      });
      dispatch(userChangedFiatCurrencyPreference(unit));
    },
    changeNetworkPreference(network: DefaultNetworkConfigurations) {
      dispatch(userChangedNetworkPreference(network));
      void analytics?.track('user_setting_updated', {
        network,
      });
    },
    changePrivacyModePreference(mode: PrivacyModePreference) {
      dispatch(userChangedPrivacyModePreference(mode));
      void analytics?.track('user_setting_updated', {
        privacy_mode: mode,
      });
    },
    changeHapticsPreference(state: HapticsPreference) {
      dispatch(userChangedHapticsPreference(state));
      void analytics?.track('user_setting_updated', {
        haptics: state,
      });
    },
    changeSecurityLevelPreference(level: SecurityLevelPreference) {
      dispatch(userChangedSecurityLevelPreference(level));
      void analytics?.track('user_setting_updated', {
        security_level: level,
      });
    },
    changeThemePreference(theme: ThemePreference) {
      dispatch(userChangedThemePreference(theme));
      void analytics?.track('user_setting_updated', {
        theme,
      });
    },
    changeNotificationsPreference(state: NotificationsPreference) {
      dispatch(userChangedNotificationPreference(state));
      void analytics?.track('user_setting_updated', {
        notifications: state,
      });
    },
    userLeavesApp(timestamp: LastActiveTimestamp) {
      dispatch(userChangedLastActive(timestamp));
    },

    // TODO: Remove when live, debug only
    toggleNetwork() {
      const network =
        networkPreference.chain.bitcoin.bitcoinNetwork === 'mainnet' ? 'testnet' : 'mainnet';
      dispatch(userChangedNetworkPreference(network));
      void analytics?.identify(undefined, {
        active_network: network,
      });
      void analytics?.track('user_setting_updated', {
        network,
      });
    },
    toggleTheme() {
      const theme = themeDerivedFromThemePreference === 'light' ? 'dark' : 'light';
      dispatch(userChangedThemePreference(theme));
      void analytics?.track('user_setting_updated', {
        theme,
      });
      void analytics?.identify(undefined, {
        active_theme: theme,
      });
    },
  };
}
