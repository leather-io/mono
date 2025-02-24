import { t } from '@lingui/macro';

import { AccountDisplayPreference, AccountDisplayPreferenceInfo } from '@leather.io/models';

export enum AccountDisplayPreferenceType {
  NativeSegwit = 'native-segwit',
  Taproot = 'taproot',
  Bns = 'bns',
  Stacks = 'stacks',
}
// moving `accountDisplayPreferencesKeyedByType` from @leather.io/constants package
// as we need to translate the strings.
export function getAccountDisplayPreferencesKeyedByType(): Record<
  AccountDisplayPreference,
  AccountDisplayPreferenceInfo
> {
  return {
    [AccountDisplayPreferenceType.NativeSegwit]: {
      type: 'native-segwit',
      blockchain: 'bitcoin',
      name: t({ id: 'account_display_preference.native_segwit', message: 'Native Segwit address' }),
    },
    [AccountDisplayPreferenceType.Taproot]: {
      type: 'taproot',
      blockchain: 'bitcoin',
      name: t({ id: 'account_display_preference.taproot', message: 'Taproot address' }),
    },
    [AccountDisplayPreferenceType.Bns]: {
      type: 'bns',
      blockchain: 'stacks',
      name: t({ id: 'account_display_preference.bns_name', message: 'BNS name' }),
    },
    [AccountDisplayPreferenceType.Stacks]: {
      type: 'stacks',
      blockchain: 'stacks',
      name: t({ id: 'account_display_preference.stacks_address', message: 'Stacks address' }),
    },
  };
}
