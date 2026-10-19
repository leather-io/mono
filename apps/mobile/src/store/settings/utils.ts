import type {
  AccountDisplayPreference,
  AccountId,
  AnalyticsPreference,
  BitcoinUnit,
  DefaultNetworkConfigurations,
  EmailAddress,
} from '@leather.io/models';

export const defaultNetworkPreferences = ['mainnet', 'testnet4', 'signet'] as const;
export const defaultThemePreferences = ['light', 'dark', 'system'] as const;

export type ThemePreference = 'light' | 'dark' | 'system';
export type Theme = Exclude<ThemePreference, 'system'>;
export type SecurityLevelPreference = 'insecure' | 'secure' | 'not-selected';
export type NotificationsPreference = 'enabled' | 'disabled' | 'not-selected';
export type PrivacyModePreference = 'hidden' | 'visible';
export type HapticsPreference = 'disabled' | 'enabled';
export type LastActiveTimestamp = number | null;
export type LanguagePreferenceSource = 'system' | 'user-selection';
export type CurrentAccount = AccountId | null;
export type AppIconPreference =
  | 'default'
  | 'icon-1'
  | 'icon-2'
  | 'icon-3'
  | 'icon-4'
  | 'icon-5'
  | 'icon-6'
  | 'icon-7'
  | 'icon-8'
  | 'icon-9'
  | 'icon-10'
  | 'icon-11';

export interface SettingsState {
  accountDisplayPreference: AccountDisplayPreference;
  analyticsPreference: AnalyticsPreference;
  bitcoinUnitPreference: BitcoinUnit;
  createdOn: string;
  emailAddressPreference: EmailAddress;
  fiatCurrencyPreference: string;
  networkPreference: DefaultNetworkConfigurations;
  privacyModePreference: PrivacyModePreference;
  themePreference: ThemePreference;
  securityLevelPreference: SecurityLevelPreference;
  hapticsPreference: HapticsPreference;
  lastActive: number | null;
  notificationsPreference: NotificationsPreference;
  languagePreference: 'en';
  languagePreferenceSource: LanguagePreferenceSource;
  assetVisibility: Record<string, boolean>;
  currentAccount: CurrentAccount;
  appIconPreference: AppIconPreference;
}
