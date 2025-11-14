import { Money } from '../money.model';
import { BaseNonFungibleCryptoAsset } from './asset.model';

export const sip9ContentTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  'image/avif',
  'video/mp4',
  'video/webm',
  'video/mov',
  'video/quicktime',
  'video/avi',
  'video/x-msvideo',
  'video/ogg',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/aac',
  'audio/flac',
  'audio/webm',
  'model/gltf+json',
  'model/gltf-binary',
  'application/octet-stream',
  'text/plain',
  'text/html',
  'text/markdown',
  'application/pdf',
  'application/json',
  'text/javascript',
  'application/javascript',
  'application/zip',
  'unknown',
  '',
] as const;

export type Sip9ContentType = (typeof sip9ContentTypes)[number];

export interface Sip9Collection {
  name: string;
  collectionExplorerUrl: string;
  totalItems?: number;
  floorPrice?: Money;
  latestSale?: Money;
}

export interface Sip9AssetContent {
  contentUrl: string;
  contentType: Sip9ContentType;
}

export interface Sip9Attribute {
  traitType: string;
  value: any;
  rarityPercent?: number;
}

export interface Sip9Asset extends BaseNonFungibleCryptoAsset {
  readonly chain: 'stacks';
  readonly protocol: 'sip9';
  readonly assetId: string;
  readonly contractId: string;
  readonly tokenId: number;
  readonly name: string;
  readonly description: string;
  readonly content: Sip9AssetContent;
  readonly attributes?: Sip9Attribute[];
  readonly collection?: Sip9Collection;
  readonly creator?: string;
  readonly rarityRank?: number;
}
