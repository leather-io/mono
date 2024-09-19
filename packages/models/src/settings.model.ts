import { Blockchain } from './types';

export type AccountDisplayPreference = 'native-segwit' | 'taproot' | 'bns' | 'stacks';
export interface AccountDisplayPreferenceInfo {
  type: AccountDisplayPreference;
  blockchain: Blockchain;
  name: string;
}

export type AnalyticsPreference = 'consent-given' | 'rejects-tracking';
