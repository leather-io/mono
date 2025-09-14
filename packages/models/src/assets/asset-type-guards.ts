import {
  Brc20Asset,
  BtcAsset,
  CryptoAsset,
  FungibleCryptoAsset,
  InscriptionAsset,
  NativeCryptoAsset,
  NonFungibleCryptoAsset,
  RuneAsset,
  Sip9Asset,
  Sip10Asset,
  Src20Asset,
  StampAsset,
  Stx20Asset,
  StxAsset,
} from './asset.model';

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

export function isBrc20Asset(asset: CryptoAsset): asset is Brc20Asset {
  return asset.protocol === 'brc20';
}

export function isSrc20Asset(asset: CryptoAsset): asset is Src20Asset {
  return asset.protocol === 'src20';
}

export function isStx20Asset(asset: CryptoAsset): asset is Stx20Asset {
  return asset.protocol === 'stx20';
}

export function isRuneAsset(asset: CryptoAsset): asset is RuneAsset {
  return asset.protocol === 'rune';
}

export function isInscriptionAsset(asset: CryptoAsset): asset is InscriptionAsset {
  return asset.protocol === 'inscription';
}

export function isStampAsset(asset: CryptoAsset): asset is StampAsset {
  return asset.protocol === 'stamp';
}

export function isSip9Asset(asset: CryptoAsset): asset is Sip9Asset {
  return asset.protocol === 'sip9';
}
