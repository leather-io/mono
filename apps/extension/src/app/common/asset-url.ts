import { type CryptoAssetId, CryptoAssetProtocols } from '@leather.io/models';
import {
  type SerializedCryptoAssetId,
  deserializeAssetId,
  serializeAssetId,
} from '@leather.io/utils';

/**
 * Converts a serialized asset ID to a URL-friendly path segment.
 *
 * For native BTC/STX tokens, returns just the symbol (e.g., "BTC", "STX").
 * For other assets, uses "/" as separator instead of "|" (e.g., "sip10/SP...::token").
 */
export function assetIdToUrlPath(assetId: SerializedCryptoAssetId): string {
  const parsed = deserializeAssetId(assetId);

  if (parsed.protocol === CryptoAssetProtocols.nativeBtc) {
    return 'BTC';
  }
  if (parsed.protocol === CryptoAssetProtocols.nativeStx) {
    return 'STX';
  }

  return `${parsed.protocol}/${encodeURIComponent(parsed.id)}`;
}

/**
 * Converts a URL path segment back to a serialized asset ID.
 *
 * Handles simplified native token paths ("BTC", "STX") and full protocol/id paths.
 */
export function urlPathToAssetId(urlPath: string): SerializedCryptoAssetId {
  if (urlPath === 'BTC') {
    return serializeAssetId({ protocol: CryptoAssetProtocols.nativeBtc, id: 'BTC' });
  }
  if (urlPath === 'STX') {
    return serializeAssetId({ protocol: CryptoAssetProtocols.nativeStx, id: 'STX' });
  }

  const slashIndex = urlPath.indexOf('/');
  if (slashIndex === -1) {
    throw new Error(`Invalid asset URL path: ${urlPath}`);
  }

  const protocol = urlPath.slice(0, slashIndex);
  const id = decodeURIComponent(urlPath.slice(slashIndex + 1));

  return serializeAssetId({ protocol, id } as CryptoAssetId);
}

/**
 * Creates the full route path for a token details page.
 */
export function createTokenDetailsPath(assetId: SerializedCryptoAssetId): string {
  return `/token/${assetIdToUrlPath(assetId)}`;
}
