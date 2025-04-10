import { t } from '@lingui/macro';

import { CryptoAssetProtocol } from '@leather.io/models';

export function getChainLayerFromAssetProtocol(protocol: CryptoAssetProtocol) {
  switch (protocol) {
    case 'nativeBtc':
      return t({ id: 'account_balance.caption_left.native', message: 'Layer 1' });
    case 'nativeStx':
      return t({ id: 'account_balance.caption_left.stacks', message: 'Layer 2' });
    case 'sip10':
      return t({ id: 'account_balance.caption_left.sip10', message: 'Layer 2 · Stacks' });
    case 'rune':
      return t({ id: 'account_balance.caption_left.rune', message: 'Runes' });
    default:
      return '';
  }
}
