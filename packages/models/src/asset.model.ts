import { InscriptionMimeType } from './inscription-mime-type.model';

export const CryptoAssetChains = {
  bitcoin: 'bitcoin',
  stacks: 'stacks',
} as const;
export const CryptoAssetCategories = {
  fungible: 'fungible',
  nft: 'nft',
} as const;
export const CryptoAssetProtocols = {
  nativeBtc: 'nativeBtc',
  nativeStx: 'nativeStx',
  sip10: 'sip10',
  brc20: 'brc20',
  src20: 'src20',
  stx20: 'stx20',
  rune: 'rune',
  stamp: 'stamp',
  sip9: 'sip9',
  inscription: 'inscription',
} as const;

export type CryptoAssetChain = keyof typeof CryptoAssetChains;
export type CryptoAssetCategory = keyof typeof CryptoAssetCategories;
export type CryptoAssetProtocol = keyof typeof CryptoAssetProtocols;

export interface BaseCryptoAsset {
  readonly chain: CryptoAssetChain;
  readonly category: CryptoAssetCategory;
  readonly protocol: CryptoAssetProtocol;
}

// Fungible asset types
interface BaseFungibleCryptoAsset extends BaseCryptoAsset {
  readonly category: 'fungible';
  readonly symbol: string;
  readonly decimals: number;
  readonly hasMemo: boolean;
}
export interface BtcAsset extends BaseFungibleCryptoAsset {
  readonly chain: 'bitcoin';
  readonly protocol: 'nativeBtc';
  readonly symbol: 'BTC';
}
export interface StxAsset extends BaseFungibleCryptoAsset {
  readonly chain: 'stacks';
  readonly protocol: 'nativeStx';
  readonly symbol: 'STX';
}
export interface Brc20Asset extends BaseFungibleCryptoAsset {
  readonly chain: 'bitcoin';
  readonly protocol: 'brc20';
  readonly symbol: string;
}
export interface Src20Asset extends BaseFungibleCryptoAsset {
  readonly chain: 'bitcoin';
  readonly protocol: 'src20';
  readonly id: string;
  readonly symbol: string;
  readonly deploy_tx: string;
  readonly deploy_img: string;
}
export interface RuneAsset extends BaseFungibleCryptoAsset {
  readonly chain: 'bitcoin';
  readonly protocol: 'rune';
  readonly spacedRuneName: string;
  readonly runeName: string;
  readonly symbol: string;
}
export interface Sip10Asset extends BaseFungibleCryptoAsset {
  readonly chain: 'stacks';
  readonly protocol: 'sip10';
  readonly name: string;
  readonly canTransfer: boolean;
  readonly assetId: string;
  readonly contractId: string;
  readonly imageCanonicalUri: string;
  readonly symbol: string;
}
export interface Stx20Asset extends BaseFungibleCryptoAsset {
  readonly chain: 'stacks';
  readonly protocol: 'stx20';
  readonly symbol: string;
}
export type NativeCryptoAsset = BtcAsset | StxAsset;
export type FungibleCryptoAsset =
  | NativeCryptoAsset
  | Sip10Asset
  | Brc20Asset
  | Src20Asset
  | Stx20Asset
  | RuneAsset;

// NFT asset types
interface BaseNonFungibleCryptoAsset extends BaseCryptoAsset {
  readonly category: 'nft';
}
export interface InscriptionAsset extends BaseNonFungibleCryptoAsset {
  readonly chain: 'bitcoin';
  readonly protocol: 'inscription';
  readonly id: string;
  readonly mimeType: InscriptionMimeType;
  readonly number: number;
  readonly address: string;
  readonly title: string;
  readonly txid: string;
  readonly output: string;
  readonly offset: string;
  readonly preview: string;
  readonly src: string;
  readonly value: string;
  readonly genesisBlockHash: string;
  readonly genesisTimestamp: number;
  readonly genesisBlockHeight: number;
}
export interface StampAsset extends BaseNonFungibleCryptoAsset {
  readonly chain: 'bitcoin';
  readonly protocol: 'stamp';
  readonly stamp: number;
  readonly stampUrl: string;
}
export interface Sip9Asset extends BaseNonFungibleCryptoAsset {
  readonly chain: 'stacks';
  readonly protocol: 'sip9';
  readonly assetId: string;
  readonly contractId: string;
  readonly tokenId: number;
  readonly collection: string;
  readonly name: string;
  readonly description: string;
  readonly cachedImage: string;
  readonly cachedImageThumbnail: string;
}
export type NonFungibleCryptoAsset = InscriptionAsset | StampAsset | Sip9Asset;

export type CryptoAsset = FungibleCryptoAsset | NonFungibleCryptoAsset;
