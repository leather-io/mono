import { NonFungibleCryptoAsset } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

import { formatInsciptionName, isValidInscription, isValidStamp } from './collectibles.utils';

function isBnsName(collectible: NonFungibleCryptoAsset) {
  return 'fullName' in collectible;
}

export function serializeCollectible(collectible: NonFungibleCryptoAsset) {
  if (isBnsName(collectible)) {
    return {
      name: collectible.fullName,
      type: 'bns',
      src: 'bns',
    };
  }

  switch (collectible.protocol) {
    case 'inscription':
      if (!isValidInscription(collectible)) return null;
      return {
        name: formatInsciptionName(collectible.title),
        type: collectible.protocol,
        src: collectible.src,
        mimeType: collectible.mimeType,
      };
    case 'sip9':
      return {
        name: collectible.name,
        type: collectible.protocol,
        src: collectible.cachedImage,
      };
    case 'stamp':
      if (!isValidStamp(collectible)) return null;
      return {
        name: collectible.stamp.toString(),
        type: collectible.protocol,
        src: collectible.stampUrl,
      };
    default:
      assertUnreachable(collectible);
  }
}
