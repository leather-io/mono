import {
  BtcAsset,
  CryptoAsset,
  FungibleCryptoAsset,
  NativeCryptoAsset,
  NonFungibleCryptoAsset,
  Sip10Asset,
  StxAsset,
} from './asset.model';
import { Sip9Asset } from './sip9-asset.model';

export function isFungibleAsset(asset: CryptoAsset): asset is FungibleCryptoAsset {
  return asset.category === 'fungible';
}

export function isNonFungibleAsset(asset: CryptoAsset): asset is NonFungibleCryptoAsset {
  return asset.category === 'nft';
}

export function isBtcAsset(asset: CryptoAsset): asset is BtcAsset {
  return asset.protocol === 'nativeBtc';
}

export function isStxAsset(asset: CryptoAsset): asset is StxAsset {
  return asset.protocol === 'nativeStx';
}

export function isNativeAsset(asset: CryptoAsset): asset is NativeCryptoAsset {
  return isBtcAsset(asset) || isStxAsset(asset);
}

export function isSip10Asset(asset: CryptoAsset): asset is Sip10Asset {
  return asset.protocol === 'sip10';
}

export function isSwappableAsset(asset: CryptoAsset): asset is NativeCryptoAsset | Sip10Asset {
  return isNativeAsset(asset) || isSip10Asset(asset);
}

export function isSip9Asset(asset: CryptoAsset): asset is Sip9Asset {
  return asset.protocol === 'sip9';
}
