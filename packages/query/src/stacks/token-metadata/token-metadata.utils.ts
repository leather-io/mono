import type {
  FtMetadataResponse,
  NftMetadataResponse,
  NotFoundErrorResponse,
} from '@hirosystems/token-metadata-api-client';

export type FtAssetResponse = FtMetadataResponse | NotFoundErrorResponse;
export type NftAssetResponse = NftMetadataResponse | NotFoundErrorResponse;
