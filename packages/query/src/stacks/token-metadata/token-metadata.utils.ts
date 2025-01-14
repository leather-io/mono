import type {
  FtMetadataResponse,
  NftMetadataResponse,
  NotFoundErrorResponse,
} from '@hirosystems/token-metadata-api-client';

export type FtAssetResponse = FtMetadataResponse | NotFoundErrorResponse;
export type NftAssetResponse = NftMetadataResponse | NotFoundErrorResponse;

function isAssetMetadataNotFoundResponse(
  resp: FtAssetResponse | NftAssetResponse
): resp is NotFoundErrorResponse {
  return 'error' in resp;
}

export function isFtAsset(resp: FtAssetResponse | null | undefined): resp is FtMetadataResponse {
  return !!resp && !isAssetMetadataNotFoundResponse(resp);
}

export function isNftAsset(resp: NftAssetResponse | null | undefined): resp is NftMetadataResponse {
  return !!resp && !isAssetMetadataNotFoundResponse(resp);
}
