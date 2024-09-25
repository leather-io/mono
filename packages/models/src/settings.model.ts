import { z } from 'zod';

import { Blockchain } from './types';

export type AccountDisplayPreference = 'native-segwit' | 'taproot' | 'bns' | 'stacks';
export interface AccountDisplayPreferenceInfo {
  type: AccountDisplayPreference;
  blockchain: Blockchain;
  name: string;
}

export type AnalyticsPreference = 'consent-given' | 'rejects-tracking';

export const emailAddressSchema = z.string().email({ message: 'Invalid email address' });
export type EmailAddress = z.infer<typeof emailAddressSchema>;
