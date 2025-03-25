// TODO LEA-2402: investigate moving this to services / UI to share with the web
import {
  InscriptionCryptoAssetInfo,
  Sip9CryptoAssetInfo,
  StampCryptoAssetInfo,
} from '@leather.io/models';
import { isDefined, isEmptyString } from '@leather.io/utils';

export function isValidInscription(collectible: InscriptionCryptoAssetInfo) {
  return !isEmptyString(collectible.src) && isDefined(collectible.src);
}

export function isValidSip9(collectible: Sip9CryptoAssetInfo) {
  return (
    !isEmptyString(collectible.cachedImage) &&
    isDefined(collectible.cachedImage) &&
    collectible.name !== 'BNS - Archive'
  );
}

export function isValidStamp(collectible: StampCryptoAssetInfo) {
  return !isEmptyString(collectible.stampUrl) && isDefined(collectible.stampUrl);
}
export function formatInsciptionName(name: string) {
  return name.replace(/Inscription/g, '#');
}
