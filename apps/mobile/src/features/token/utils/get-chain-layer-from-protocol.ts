import { t } from '@lingui/core/macro';

import { CryptoAssetProtocol } from '@leather.io/models';

export function getChainLayerFromAssetProtocol(protocol: CryptoAssetProtocol) {
  switch (protocol) {
    case 'nativeBtc':
      return t`Layer 1`;
    case 'nativeStx':
      return t`Layer 2`;
    case 'sip10':
      return t`Layer 2 · Stacks`;
    case 'rune':
      return t`Runes`;
    default:
      return '';
  }
}
