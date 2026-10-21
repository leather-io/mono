import { type CryptoAsset } from './asset.model';

export function isFungibleAsset(asset: CryptoAsset) {
  return asset.category === 'fungible';
}

export function isNonFungibleAsset(asset: CryptoAsset) {
  return asset.category === 'nft';
}

export function isBtcAsset(asset: CryptoAsset) {
  return asset.protocol === 'nativeBtc';
}

export function isStxAsset(asset: CryptoAsset) {
  return asset.protocol === 'nativeStx';
}

export function isNativeAsset(asset: CryptoAsset) {
  return isBtcAsset(asset) || isStxAsset(asset);
}

export function isSip10Asset(asset: CryptoAsset) {
  return asset.protocol === 'sip10';
}

export function isSwappableAsset(asset: CryptoAsset) {
  return isNativeAsset(asset) || isSip10Asset(asset);
}

export function isSip9Asset(asset: CryptoAsset) {
  return asset.protocol === 'sip9';
}
