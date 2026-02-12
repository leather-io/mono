import { CryptoAssetProtocol, CryptoAssetProtocols } from '@leather.io/models';
import {
  type SerializedCryptoAssetId,
  deserializeAssetId,
  serializeAssetId,
} from '@leather.io/utils';

const supportedAssetProtocols = [
  'nativeBtc',
  'nativeStx',
  'sip10',
  'rune',
  'sip9',
  'inscription',
  'stamp',
] as const;

const supportedFungibleAssetProtocols = ['nativeBtc', 'nativeStx', 'sip10', 'rune'] as const;

const supportedNonFungibleAssetProtocols = ['inscription', 'sip9', 'stamp'] as const;

export type SupportedAssetProtocol = (typeof supportedAssetProtocols)[number];
export type SupportedFungibleAssetProtocol = (typeof supportedFungibleAssetProtocols)[number];
export type SupportedNonFungibleAssetProtocol = (typeof supportedNonFungibleAssetProtocols)[number];

export function isSupportedFungibleAssetProtocol(
  value: CryptoAssetProtocol
): value is SupportedFungibleAssetProtocol {
  return (supportedFungibleAssetProtocols as readonly string[]).includes(value);
}

export function isSupportedNonFungibleAssetProtocol(
  value: CryptoAssetProtocol
): value is SupportedNonFungibleAssetProtocol {
  return (supportedNonFungibleAssetProtocols as readonly string[]).includes(value);
}

export function isSupportedAssetProtocol(
  value: CryptoAssetProtocol
): value is SupportedAssetProtocol {
  return (supportedAssetProtocols as readonly string[]).includes(value);
}

export function assetIdToUrlPath(assetId: SerializedCryptoAssetId): string {
  const parsed = deserializeAssetId(assetId);

  if (parsed.protocol === CryptoAssetProtocols.nativeBtc) {
    return 'btc';
  }
  if (parsed.protocol === CryptoAssetProtocols.nativeStx) {
    return 'stx';
  }
  if (parsed.protocol === CryptoAssetProtocols.sip10) {
    const [contractId, assetName] = parsed.id.split('::');
    return `${assetName}/${contractId}`;
  }

  return encodeURIComponent(assetId);
}

export function urlPathToAssetId(urlPath: string): SerializedCryptoAssetId {
  const upperPath = urlPath.toUpperCase();
  if (upperPath === 'BTC') {
    return serializeAssetId({ protocol: CryptoAssetProtocols.nativeBtc, id: 'BTC' });
  }
  if (upperPath === 'STX') {
    return serializeAssetId({ protocol: CryptoAssetProtocols.nativeStx, id: 'STX' });
  }

  const slashIndex = urlPath.indexOf('/');
  if (slashIndex !== -1) {
    const assetName = urlPath.slice(0, slashIndex);
    const contractId = urlPath.slice(slashIndex + 1);
    if (contractId.startsWith('SP') || contractId.startsWith('SM')) {
      return serializeAssetId({
        protocol: CryptoAssetProtocols.sip10,
        id: `${contractId}::${assetName}`,
      });
    }
  }

  return decodeURIComponent(urlPath) as SerializedCryptoAssetId;
}

export function createTokenDetailsPath(assetId: SerializedCryptoAssetId): string {
  return `/token/${assetIdToUrlPath(assetId)}`;
}
