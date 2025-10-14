import { AvailableLanguageCode } from '@/i18n/languages';
import z from 'zod';

import {
  AccountDisplayPreference,
  AccountId,
  AnalyticsPreference,
  BitcoinUnit,
  DefaultNetworkConfigurations,
  EmailAddress,
  QuoteCurrency,
} from '@leather.io/models';
import { SerializedCryptoAssetId } from '@leather.io/utils';

export const defaultNetworkPreferences = ['mainnet', 'testnet4', 'signet'] as const;
export type DefaultNetworkPreference = (typeof defaultNetworkPreferences)[number];
export const defaultThemePreferences = ['light', 'dark', 'system'] as const;

export type ThemePreference = (typeof defaultThemePreferences)[number];
export type Theme = Exclude<ThemePreference, 'system'>;
export type SecurityLevelPreference = 'insecure' | 'secure' | 'not-selected';
export type NotificationsPreference = 'enabled' | 'disabled' | 'not-selected';
export type PrivacyModePreference = 'hidden' | 'visible';
export type HapticsPreference = 'disabled' | 'enabled';
export type LastActiveTimestamp = number | null;
export type LanguagePreferenceSource = 'system' | 'user-selection';
export type AssetVisibility = Record<SerializedCryptoAssetId, boolean>;
export type CurrentAccount = AccountId | null;

export interface SettingsState {
  accountDisplayPreference: AccountDisplayPreference;
  analyticsPreference: AnalyticsPreference;
  bitcoinUnitPreference: BitcoinUnit;
  createdOn: string;
  emailAddressPreference: EmailAddress;
  fiatCurrencyPreference: QuoteCurrency;
  networkPreference: DefaultNetworkConfigurations;
  privacyModePreference: PrivacyModePreference;
  themePreference: ThemePreference;
  securityLevelPreference: SecurityLevelPreference;
  hapticsPreference: HapticsPreference;
  lastActive: LastActiveTimestamp;
  notificationsPreference: NotificationsPreference;
  languagePreference: AvailableLanguageCode;
  languagePreferenceSource: LanguagePreferenceSource;
  assetVisibility: AssetVisibility;
  currentAccount: CurrentAccount;
}

// lose schema definition, we don't infer SettingsState type from it to keep it simple
export const settingsSchema = z.object({
  accountDisplayPreference: z.string(),
  analyticsPreference: z.string(),
  bitcoinUnitPreference: z.string(),
  createdOn: z.string(),
  emailAddressPreference: z.string(),
  fiatCurrencyPreference: z.string(),
  networkPreference: z.string(),
  privacyModePreference: z.string(),
  themePreference: z.string(),
  securityLevelPreference: z.string(),
  hapticsPreference: z.string().optional(),
  lastActive: z.union([z.number(), z.null()]),
  notificationsPreference: z.string().optional(),
  languagePreference: z.string().optional(),
  languagePreferenceSource: z.string().optional(),
  assetVisibility: z.record(z.string(), z.boolean()).optional(),
  currentAccount: z.union([z.object(), z.null()]).optional(),
});
