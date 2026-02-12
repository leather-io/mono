import { type CryptoAssetId, CryptoAssetProtocols } from '@leather.io/models';
import {
  type SerializedCryptoAssetId,
  deserializeAssetId,
  serializeAssetId,
} from '@leather.io/utils';

function assetIdToUrlPath(assetId: SerializedCryptoAssetId): string {
  const parsed = deserializeAssetId(assetId);

  if (parsed.protocol === CryptoAssetProtocols.nativeBtc) {
    return 'BTC';
  }
  if (parsed.protocol === CryptoAssetProtocols.nativeStx) {
    return 'STX';
  }

  return `${parsed.protocol}/${encodeURIComponent(parsed.id)}`;
}

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

export function createTokenDetailsPath(assetId: SerializedCryptoAssetId): string {
  return `/token/${assetIdToUrlPath(assetId)}`;
}
