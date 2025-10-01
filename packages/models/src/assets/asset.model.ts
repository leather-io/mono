import { InscriptionMimeType } from '../inscription-mime-type.model';

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
  brc20: 'brc20',
  src20: 'src20',
  stx20: 'stx20',
  rune: 'rune',
} as const;
export const NonFungibleCryptoAssetProtocols = {
  stamp: 'stamp',
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

export type Sip9ContentType =
  // Images
  | 'image/jpeg'
  | 'image/jpg'
  | 'image/png'
  | 'image/gif'
  | 'image/webp'
  | 'image/svg+xml'
  | 'image/bmp'
  | 'image/tiff'
  | 'image/avif'

  // Videos
  | 'video/mp4'
  | 'video/webm'
  | 'video/mov'
  | 'video/quicktime'
  | 'video/avi'
  | 'video/x-msvideo'
  | 'video/ogg'

  // Audio
  | 'audio/mpeg'
  | 'audio/mp3'
  | 'audio/wav'
  | 'audio/x-wav'
  | 'audio/ogg'
  | 'audio/aac'
  | 'audio/flac'
  | 'audio/webm'

  // 3D Models
  | 'model/gltf+json'
  | 'model/gltf-binary'
  | 'application/octet-stream' // GLB files sometimes use this

  // Documents/Text
  | 'text/plain'
  | 'text/html'
  | 'text/markdown'
  | 'application/pdf'
  | 'application/json'

  // Interactive/Web
  | 'text/javascript'
  | 'application/javascript'

  // Archives
  | 'application/zip'

  // Unknown/Fallback
  | 'unknown';

export type SupportedSip9ContentType =
  | Extract<
      Sip9ContentType,
      | 'image/jpeg'
      | 'image/png'
      | 'image/gif'
      | 'image/webp'
      | 'image/svg+xml'
      | 'image/bmp'
      | 'image/tiff'
      | 'image/avif'
      | 'video/mp4'
      | 'audio/mpeg'
      | 'audio/mp3'
      | 'audio/wav'
      | 'audio/ogg'
      | 'audio/aac'
      | 'audio/flac'
      | 'audio/webm'
      | 'text/plain'
      | 'application/octet-stream'
      | 'model/gltf+json'
      | 'model/gltf-binary'
    >
  | '';

export interface Sip9Collection {
  id: string;
  type?: string;
  name: string;
  isVerified: boolean;
  locationUrl: string;
  totalItems?: number;
  floorPrice?: {
    amount: number;
    unit: string;
  };
}

export interface Sip9Owner {
  address: string;
  chain: string;
  id: string;
  displayName: string;
  slug: string;
  avatarUrl: string | null;
  avatarContentType: string | null;
  profileUrl: string;
  bio: string | null;
  isVerified: boolean;
}

export interface Sip9AssetContent {
  contentUrl: string;
  contentType: string;
}

export interface Sip9Attribute {
  traitType: string;
  displayType?: string;
  value: any;
  rarityPercent?: number;
}

export interface Sip9Details {
  id?: string;
  name: string;
  description: string;
  assetContent?: Sip9AssetContent;
  cachedImage: string;
  cachedImageThumbnail: string;
  contentType: SupportedSip9ContentType;
  locationUrl?: string;
  collection?: Sip9Collection;
  owner?: Sip9Owner;
  attributes?: Sip9Attribute[];
  rarityRank?: number;
}
export interface Sip9Asset extends BaseNonFungibleCryptoAsset {
  readonly chain: 'stacks';
  readonly protocol: 'sip9';
  readonly assetId: string;
  readonly contractId: string;
  readonly tokenId: number;
  readonly name: string;
  readonly description: string;
  readonly cachedImage: string;
  readonly cachedImageThumbnail: string;
  readonly contentType: SupportedSip9ContentType;
  readonly details: Sip9Details;
  readonly collection?: Sip9Collection;
}
export type NonFungibleCryptoAsset = InscriptionAsset | StampAsset | Sip9Asset;

export type CryptoAsset = FungibleCryptoAsset | NonFungibleCryptoAsset;

export interface FungibleAssetId {
  protocol: FungibleCryptoAssetProtocol;
  id: string;
}
