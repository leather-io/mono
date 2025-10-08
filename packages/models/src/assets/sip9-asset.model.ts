import { BaseNonFungibleCryptoAsset } from './asset.model';

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
  name: string;
  collectionExplorerUrl: string;
  totalItems?: number;
}

export interface Sip9AssetContent {
  contentUrl: string;
  contentType: string;
}

export interface Sip9Attribute {
  attributeTraitType: string;
  attributeValue: any;
  attributeRarityPercent?: number;
}

export interface Sip9Details {
  id?: string;
  name: string;
  description: string;
  assetContent?: Sip9AssetContent;
  cachedImage: string;
  cachedImageThumbnail: string;
  contentType: SupportedSip9ContentType;
  collection?: Sip9Collection;
  attributes?: Sip9Attribute[];
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
