import { StacksFungibleTokenAsset } from '@leather-wallet/models';

import { isUndefined, isValidUrl } from '../..';
import { convertUnicodeToAscii } from '../string-utils';

export function isFtNameLikeStx(name: string) {
  return ['stx', 'stack', 'stacks'].includes(convertUnicodeToAscii(name).toLocaleLowerCase());
}

export function getImageCanonicalUri(imageCanonicalUri: string, name: string) {
  return imageCanonicalUri && isValidUrl(imageCanonicalUri) && !isFtNameLikeStx(name)
    ? imageCanonicalUri
    : '';
}

export function isTransferableStacksFungibleTokenAsset(asset: StacksFungibleTokenAsset) {
  return !isUndefined(asset.decimals) && !isUndefined(asset.name) && !isUndefined(asset.symbol);
}
