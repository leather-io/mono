import { InscriptionAsset, Sip9Asset, StampAsset } from '@leather.io/models';
import { isDefined, isEmptyString } from '@leather.io/utils';

export function isValidInscription(collectible: InscriptionAsset) {
  return !isEmptyString(collectible.src) && isDefined(collectible.src);
}

export function isValidSip9(collectible: Sip9Asset) {
  return (
    !isEmptyString(collectible.cachedImage) &&
    isDefined(collectible.cachedImage) &&
    collectible.name !== 'BNS - Archive'
  );
}

export function isValidStamp(collectible: StampAsset) {
  return !isEmptyString(collectible.stampUrl) && isDefined(collectible.stampUrl);
}
export function formatInsciptionName(name: string) {
  return name.replace(/Inscription/g, '#');
}
