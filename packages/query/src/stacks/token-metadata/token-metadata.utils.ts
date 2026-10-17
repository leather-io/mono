import type {
  FtMetadataResponse,
  NftMetadataResponse,
  NotFoundErrorResponse,
} from '@hirosystems/token-metadata-api-client';

export type FtAssetResponse = FtMetadataResponse | NotFoundErrorResponse;
export type NftAssetResponse = NftMetadataResponse | NotFoundErrorResponse;

export function isFtAsset(resp: FtAssetResponse | null | undefined): resp is FtMetadataResponse {
  return !!resp && !('error' in resp);
}

export function isNftAsset(resp: NftAssetResponse | null | undefined): resp is NftMetadataResponse {
  return !!resp && !('error' in resp);
}
