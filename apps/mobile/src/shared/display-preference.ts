import { t } from '@lingui/core/macro';

import {
  AccountDisplayPreference,
  AccountDisplayPreferenceInfo,
  CryptoAssetProtocol,
} from '@leather.io/models';

enum AccountDisplayPreferenceType {
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
      name: t`Native Segwit address`,
    },
    [AccountDisplayPreferenceType.Taproot]: {
      type: 'taproot',
      blockchain: 'bitcoin',
      name: t`Taproot address`,
    },
    [AccountDisplayPreferenceType.Bns]: {
      type: 'bns',
      blockchain: 'stacks',
      name: t`BNS name`,
    },
    [AccountDisplayPreferenceType.Stacks]: {
      type: 'stacks',
      blockchain: 'stacks',
      name: t`Stacks address`,
    },
  };
}
export function getChainDisplayLabel(
  chainPreference: 'bitcoin' | 'stacks' | AccountDisplayPreference
): string {
  return {
    bitcoin: t`Layer 1 • Bitcoin`,
    taproot: t`Layer 1 • Bitcoin`,
    'native-segwit': t`Layer 1 • Bitcoin`,
    stacks: t`Layer 2 • Stacks`,
    bns: t`Layer 2 • Stacks`,
  }[chainPreference];
}

export function getProtocolDisplayLabel(protocol: CryptoAssetProtocol): string {
  return {
    sip9: t`SIP-009`,
    inscription: t`Inscription`,
    nativeBtc: t`Bitcoin`,
    nativeStx: t`Stacks`,
    sip10: t`SIP-010`,
  }[protocol];
}
