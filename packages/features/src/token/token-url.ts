import { type CryptoAssetId, CryptoAssetProtocols } from '@leather.io/models';
import { type SerializedCryptoAssetId, serializeAssetId } from '@leather.io/utils';

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
