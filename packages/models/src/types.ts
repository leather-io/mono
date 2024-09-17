import { LiteralUnion } from './types.utils';

export type Blockchain = LiteralUnion<'bitcoin' | 'stacks', string>;

export type AccountDisplayPreference = 'ns' | 'tr' | 'bns' | 'stacks';
export interface AccountDisplayPreferenceInfo {
  type: AccountDisplayPreference;
  blockchain: Blockchain;
  name: string;
}
