import { NonFungibleCryptoAsset } from '@leather.io/models';
import { BitcoinQueryPrefixes, fetchInscriptionTextContent } from '@leather.io/query';
import { assertUnreachable } from '@leather.io/utils';

import {
  formatInsciptionName,
  isValidInscription,
  isValidSip9,
  isValidStamp,
} from './collectibles.utils';

// const mockTextInscription = {
//   address: 'bc1pm0tlsgs6sy98psj5fzgkvaz0zywg4nm6g9mgpj09uc0cq53tcq0qqhneep',
//   category: 'nft',
//   chain: 'bitcoin',
//   genesisBlockHash: '00000000000000000003fadebc0233e452320eb3254e229bbc38f350361d1f51',
//   genesisBlockHeight: 827025,
//   genesisTimestamp: 1706032146,
//   id: '566091fec1b7033565a2229c79999183dbb752fcd730165833e60c2a4e59348ei0',
//   mimeType: 'text',
//   name: 'inscription',
//   number: 57071009,
//   offset: '0',
//   output: '4',
//   preview:
//     'https://ordinals.hiro.so/inscription/566091fec1b7033565a2229c79999183dbb752fcd730165833e60c2a4e59348ei0',
//   protocol: 'inscription',
//   src: 'https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals/566091fec1b7033565a2229c79999183dbb752fcd730165833e60c2a4e59348ei0',
//   title: 'Inscription 57071009',
//   txid: '6292bd02652e4d33e6c54c3f55bdd84e6f2b7ae39d6b99b403117791f45008cf',
//   value: '546',
// };

export async function serializeCollectible(collectible: NonFungibleCryptoAsset) {
  // console.log('serializeCollectible', collectible.protocol);
  switch (collectible.protocol) {
    case 'inscription':
      if (!isValidInscription(collectible)) {
        console.log('isValidInscription', collectible);
        return null;
      }
      console.log('inscription', collectible);
      const content = await fetchInscriptionTextContent(collectible.src);
      console.log('content', content);
      return {
        name: formatInsciptionName(collectible.title),
        type: collectible.protocol,
        // src: collectible.mimeType === 'text' ? content : collectible.src,
        src: collectible.src,
        mimeType: collectible.mimeType,
      };
    case 'sip9':
      if (!isValidSip9(collectible)) return null;
      return {
        name: collectible.name,
        type: collectible.protocol,
        src:
          // TODO come up with a suitable default image. Tried to use the egg.png from the assets, but it was not working.
          collectible.cachedImage !== ''
            ? collectible.cachedImage
            : 'https://assets.hiro.so/api/mainnet/token-metadata-api/SP3QSAJQ4EA8WXEDSRRKMZZ29NH91VZ6C5X88FGZQ.crashpunks-v2/5559.png',
        // : require('@/assets/stickers/egg.png'),
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
