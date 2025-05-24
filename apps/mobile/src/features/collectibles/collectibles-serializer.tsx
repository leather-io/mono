import { NonFungibleCryptoAssetInfo } from '@leather.io/models';
import { type CollectibleCardProps } from '@leather.io/ui/native';
import { assertUnreachable } from '@leather.io/utils';

import {
  formatInsciptionName,
  isValidInscription,
  isValidSip9,
  isValidStamp,
} from './collectibles.utils';

export function serializeCollectibles(collectibles: NonFungibleCryptoAssetInfo[]) {
  return collectibles
    .map(collectible => {
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
          if (!isValidSip9(collectible)) return null;
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
    })
    .filter(Boolean) as CollectibleCardProps[];
}
