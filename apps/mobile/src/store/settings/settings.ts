import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';

import { useAnalytics } from '@/utils/analytics';
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
  userChangedPrivacyModePreference,
  userChangedSecurityLevelPreference,
  userChangedThemePreference,
} from './settings.write';
import {
  HapticsPreference,
  LastActiveTimestamp,
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
};

export function useSettings() {
  const dispatch = useAppDispatch();
  const systemTheme = useColorScheme();

  const analytics = useAnalytics();
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
    whenTheme: whenTheme(themeDerivedFromThemePreference),
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
      analytics.identify({
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
      analytics.identify({
        has_email_address: !!address,
      });
    },
    changeFiatCurrencyPreference(unit: FiatCurrency) {
      analytics.track('user_setting_updated', {
        fiat_currency: unit,
      });
      dispatch(userChangedFiatCurrencyPreference(unit));
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
    userLeavesApp(timestamp: LastActiveTimestamp) {
      dispatch(userChangedLastActive(timestamp));
    },

    // TODO: Remove when live, debug only
    toggleNetwork() {
      const network =
        networkPreference.chain.bitcoin.bitcoinNetwork === 'mainnet' ? 'testnet' : 'mainnet';
      dispatch(userChangedNetworkPreference(network));
      analytics.identify({
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
      analytics.identify({
        active_theme: theme,
      });
    },
  };
}
