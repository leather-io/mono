import { InscriptionMimeType } from './bitcoin/inscription.model';

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

export interface BaseCryptoAssetInfo {
  readonly chain: CryptoAssetChain;
  readonly category: CryptoAssetCategory;
  readonly protocol: CryptoAssetProtocol;
}

// Fungible asset types
interface BaseFungibleCryptoAssetInfo extends BaseCryptoAssetInfo {
  readonly category: 'fungible';
  readonly symbol: string;
  readonly decimals: number;
  readonly hasMemo: boolean;
}
export interface BtcCryptoAssetInfo extends BaseFungibleCryptoAssetInfo {
  readonly chain: 'bitcoin';
  readonly protocol: 'nativeBtc';
  readonly symbol: 'BTC';
}
export interface StxCryptoAssetInfo extends BaseFungibleCryptoAssetInfo {
  readonly chain: 'stacks';
  readonly protocol: 'nativeStx';
  readonly symbol: 'STX';
}
export interface Brc20CryptoAssetInfo extends BaseFungibleCryptoAssetInfo {
  readonly chain: 'bitcoin';
  readonly protocol: 'brc20';
  readonly symbol: string;
}
export interface Src20CryptoAssetInfo extends BaseFungibleCryptoAssetInfo {
  readonly chain: 'bitcoin';
  readonly protocol: 'src20';
  readonly id: string;
  readonly symbol: string;
  readonly deploy_tx: string;
  readonly deploy_img: string;
}
export interface RuneCryptoAssetInfo extends BaseFungibleCryptoAssetInfo {
  readonly chain: 'bitcoin';
  readonly protocol: 'rune';
  readonly spacedRuneName: string;
  readonly runeName: string;
  readonly symbol: string;
}
export interface Sip10CryptoAssetInfo extends BaseFungibleCryptoAssetInfo {
  readonly chain: 'stacks';
  readonly protocol: 'sip10';
  readonly name: string;
  readonly canTransfer: boolean;
  readonly assetId: string;
  readonly contractId: string;
  readonly imageCanonicalUri: string;
  readonly symbol: string;
}
export interface Stx20CryptoAssetInfo extends BaseFungibleCryptoAssetInfo {
  readonly chain: 'stacks';
  readonly protocol: 'stx20';
  readonly symbol: string;
}
export type NativeCryptoAssetInfo = BtcCryptoAssetInfo | StxCryptoAssetInfo;
export type FungibleCryptoAssetInfo =
  | NativeCryptoAssetInfo
  | Sip10CryptoAssetInfo
  | Brc20CryptoAssetInfo
  | Src20CryptoAssetInfo
  | Stx20CryptoAssetInfo
  | RuneCryptoAssetInfo;

// NFT asset types
interface BaseNonFungibleCryptoAssetInfo extends BaseCryptoAssetInfo {
  readonly category: 'nft';
}
export interface InscriptionCryptoAssetInfo extends BaseNonFungibleCryptoAssetInfo {
  readonly chain: 'bitcoin';
  readonly protocol: 'inscription';
  readonly id: string;
  readonly mimeType: InscriptionMimeType;
  readonly number: number;
  // via Inscription Model
  readonly preview: string;
  readonly src: string;
  readonly title: string;
  readonly output: string;
  readonly txid: string;
  readonly offset: string;
  readonly address: string;
  readonly genesisBlockHash: string;
  readonly genesisTimestamp: number;
  readonly genesisBlockHeight: number;
  readonly value: string;
}

export interface StampCryptoAssetInfo extends BaseNonFungibleCryptoAssetInfo {
  readonly chain: 'bitcoin';
  readonly protocol: 'stamp';
  readonly stamp: number;
  readonly stampUrl: string;
}
export interface Sip9CryptoAssetInfo extends BaseNonFungibleCryptoAssetInfo {
  readonly chain: 'stacks';
  readonly protocol: 'sip9';
  readonly assetId: string;
  readonly contractId: string;
  readonly name: string;
  readonly description: string;
  readonly cachedImage: string;
  readonly cachedImageThumbnail: string;
}
export type NonFungibleCryptoAssetInfo =
  | InscriptionCryptoAssetInfo
  | StampCryptoAssetInfo
  | Sip9CryptoAssetInfo;

export type CryptoAssetInfo = FungibleCryptoAssetInfo | NonFungibleCryptoAssetInfo;
