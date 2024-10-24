import { CryptoAssetInfo } from '@leather.io/models';

export function getAssetDisplayName(asset: CryptoAssetInfo) {
  switch (asset.protocol) {
    case 'nativeBtc':
      return 'bitcoin';
    case 'nativeStx':
      return 'stacks';
    case 'brc20':
      return 'brc-20';
    case 'inscription':
      return 'inscription';
    case 'rune':
      return 'rune';
    case 'sip10':
      return asset.name;
    case 'sip9':
      return asset.name;
    case 'stamp':
      return 'stamp';
    case 'src20':
      return 'src-20';
    case 'stx20':
      return 'stx-20';
  }
}
