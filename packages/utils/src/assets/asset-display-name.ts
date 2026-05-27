import { CryptoAsset } from '@leather.io/models';

import { assertUnreachable } from '../index';

export function getAssetDisplayName(asset: CryptoAsset) {
  const { protocol } = asset;

  switch (protocol) {
    case 'nativeBtc':
      return 'bitcoin';
    case 'nativeStx':
      return 'stacks';
    case 'sip10':
      return asset.name;
    case 'sip9':
      return asset.name;
    default:
      assertUnreachable(protocol);
  }
}
