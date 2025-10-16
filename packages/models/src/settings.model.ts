import { z } from 'zod';

import { Blockchain } from './types';

export const accountDisplayPreferenceSchema = z.enum(['native-segwit', 'taproot', 'bns', 'stacks']);
export type AccountDisplayPreference = z.infer<typeof accountDisplayPreferenceSchema>;

export interface AccountDisplayPreferenceInfo {
  type: AccountDisplayPreference;
  blockchain: Blockchain;
  name: string;
}

export const analyticsPreferenceSchema = z.enum(['consent-given', 'rejects-tracking']);
export type AnalyticsPreference = z.infer<typeof analyticsPreferenceSchema>;

export const emailAddressSchema = z.email({ error: 'Invalid email address' });
export type EmailAddress = z.infer<typeof emailAddressSchema>;
