import z from 'zod';

import {
  accountDisplayPreferenceSchema,
  accountIdSchema,
  analyticsPreferenceSchema,
  bitcoinUnitSchema,
  defaultNetworkConfigurationsSchema,
  emailAddressSchema,
} from '@leather.io/models';

export const defaultNetworkPreferences = ['mainnet', 'testnet4', 'signet'] as const;
export type DefaultNetworkPreference = (typeof defaultNetworkPreferences)[number];
export const defaultThemePreferences = ['light', 'dark', 'system'] as const;

const privacyModePreferenceSchema = z.enum(['hidden', 'visible']);
const themePreferenceSchema = z.enum(['light', 'dark', 'system']);
const securityLevelPreferenceSchema = z.enum(['insecure', 'secure', 'not-selected']);
const hapticsPreferenceSchema = z.enum(['disabled', 'enabled']);
const notificationsPreferenceSchema = z.enum(['enabled', 'disabled', 'not-selected']);
const languagePreferenceSchema = z.enum(['en']);
const languagePreferenceSourceSchema = z.enum(['system', 'user-selection']);
const assetVisibilitySchema = z.record(z.string(), z.boolean());
const currentAccountSchema = z.union([accountIdSchema, z.null()]);

export const settingsSchema = z.object({
  accountDisplayPreference: accountDisplayPreferenceSchema,
  analyticsPreference: analyticsPreferenceSchema,
  bitcoinUnitPreference: bitcoinUnitSchema,
  createdOn: z.string(),
  emailAddressPreference: emailAddressSchema,
  fiatCurrencyPreference: z.string(),
  networkPreference: defaultNetworkConfigurationsSchema,
  privacyModePreference: privacyModePreferenceSchema,
  themePreference: themePreferenceSchema,
  securityLevelPreference: securityLevelPreferenceSchema,
  hapticsPreference: hapticsPreferenceSchema.optional().default('disabled'),
  lastActive: z.union([z.number(), z.null()]),
  notificationsPreference: notificationsPreferenceSchema.optional().default('not-selected'),
  languagePreference: languagePreferenceSchema.optional().default('en'),
  languagePreferenceSource: languagePreferenceSourceSchema.optional().default('system'),
  assetVisibility: assetVisibilitySchema.optional().default({}),
  currentAccount: currentAccountSchema.optional().default(null),
});

export type SettingsState = z.infer<typeof settingsSchema>;

export type ThemePreference = z.infer<typeof themePreferenceSchema>;
export type Theme = Exclude<ThemePreference, 'system'>;
export type SecurityLevelPreference = z.infer<typeof securityLevelPreferenceSchema>;
export type NotificationsPreference = z.infer<typeof notificationsPreferenceSchema>;
export type PrivacyModePreference = z.infer<typeof privacyModePreferenceSchema>;
export type HapticsPreference = z.infer<typeof hapticsPreferenceSchema>;
export type LastActiveTimestamp = number | null;
export type LanguagePreferenceSource = z.infer<typeof languagePreferenceSourceSchema>;
export type AssetVisibility = z.infer<typeof assetVisibilitySchema>;
export type CurrentAccount = z.infer<typeof currentAccountSchema>;
