import { t } from '@lingui/core/macro';

import { AccountDisplayPreference, AccountDisplayPreferenceInfo, CryptoAssetProtocol } from '@leather.io/models';
import { match } from '@leather.io/utils';

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
  chainOrPreference: 'bitcoin' | 'stacks' | AccountDisplayPreference
): string {
  const matchChain = match<'bitcoin' | 'stacks' | AccountDisplayPreference>();
  return matchChain(chainOrPreference, {
    bitcoin: t`Layer 1 • Bitcoin`,
    taproot: t`Layer 1 • Bitcoin`,
    'native-segwit': t`Layer 1 • Bitcoin`,
    stacks: t`Layer 2 • Stacks`,
    bns: t`Layer 2 • Stacks`,
  });
}

export function getProtocolDisplayLabel(
  protocol: CryptoAssetProtocol
): string {
  const matchProtocol = match<CryptoAssetProtocol>();
  return matchProtocol(protocol, {
    sip9: t`SIP-009`,
    inscription: t`Inscription`,
    stamp: t`Stamp`,
    nativeBtc: t`Bitcoin`,
    nativeStx: t`Stacks`,
    sip10: t`SIP-010`,
    brc20: t`BRC-20`,
    src20: t`SRC-20`,
    stx20: t`STX-20`,
    rune: t`Rune`,
  });
}
