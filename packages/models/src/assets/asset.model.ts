import { InscriptionMimeType } from '../inscription-mime-type.model';
import { Sip9Asset } from './sip9-asset.model';

export const CryptoAssetChains = {
  bitcoin: 'bitcoin',
  stacks: 'stacks',
} as const;
export const CryptoAssetCategories = {
  fungible: 'fungible',
  nft: 'nft',
} as const;
export const FungibleCryptoAssetProtocols = {
  nativeBtc: 'nativeBtc',
  nativeStx: 'nativeStx',
  sip10: 'sip10',
} as const;
export const NonFungibleCryptoAssetProtocols = {
  sip9: 'sip9',
  inscription: 'inscription',
} as const;
export const CryptoAssetProtocols = {
  ...FungibleCryptoAssetProtocols,
  ...NonFungibleCryptoAssetProtocols,
} as const;

export type CryptoAssetChain = keyof typeof CryptoAssetChains;
export type CryptoAssetCategory = keyof typeof CryptoAssetCategories;
export type FungibleCryptoAssetProtocol = keyof typeof FungibleCryptoAssetProtocols;
export type NonFungibleCryptoAssetProtocol = keyof typeof NonFungibleCryptoAssetProtocols;
export type CryptoAssetProtocol = FungibleCryptoAssetProtocol | NonFungibleCryptoAssetProtocol;

export interface BaseCryptoAsset {
  readonly chain: CryptoAssetChain;
  readonly category: CryptoAssetCategory;
  readonly protocol: CryptoAssetProtocol;
}

// Fungible asset types
interface BaseFungibleCryptoAsset extends BaseCryptoAsset {
  readonly category: 'fungible';
  readonly protocol: FungibleCryptoAssetProtocol;
  readonly symbol: string;
  readonly decimals: number;
  readonly hasMemo: boolean;
}
export interface BtcAsset extends BaseFungibleCryptoAsset {
  readonly chain: 'bitcoin';
  readonly protocol: 'nativeBtc';
  readonly name: 'Bitcoin';
  readonly symbol: 'BTC';
}
export interface StxAsset extends BaseFungibleCryptoAsset {
  readonly chain: 'stacks';
  readonly protocol: 'nativeStx';
  readonly name: 'Stacks';
  readonly symbol: 'STX';
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
export type NativeCryptoAsset = BtcAsset | StxAsset;
export type FungibleCryptoAsset = NativeCryptoAsset | Sip10Asset;

// NFT asset types
export interface BaseNonFungibleCryptoAsset extends BaseCryptoAsset {
  readonly category: 'nft';
  readonly protocol: NonFungibleCryptoAssetProtocol;
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
  readonly thumbnailSrc?: string;
  readonly value: string;
  readonly genesisBlockHash: string;
  readonly genesisTimestamp: number;
  readonly genesisBlockHeight: number;
}

export type NonFungibleCryptoAsset = InscriptionAsset | Sip9Asset;

export type CryptoAsset = FungibleCryptoAsset | NonFungibleCryptoAsset;

export interface FungibleAssetId {
  protocol: FungibleCryptoAssetProtocol;
  id: string;
}
