import { CryptoAssetProtocol, CryptoAssetProtocols } from '@leather.io/models';
import { type SerializedCryptoAssetId, deserializeAssetId } from '@leather.io/utils';

const supportedAssetProtocols = ['nativeBtc', 'nativeStx', 'sip10', 'sip9', 'inscription'] as const;

const supportedFungibleAssetProtocols = ['nativeBtc', 'nativeStx', 'sip10'] as const;

const supportedNonFungibleAssetProtocols = ['inscription', 'sip9'] as const;

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

export function assetIdToSendPath(assetId: SerializedCryptoAssetId): string {
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

export function createTokenDetailsPath(assetId: SerializedCryptoAssetId): string {
  const parsed = deserializeAssetId(assetId);

  if (parsed.protocol === CryptoAssetProtocols.nativeBtc) {
    return '/token/btc';
  }
  if (parsed.protocol === CryptoAssetProtocols.nativeStx) {
    return '/token/stx';
  }

  return `/token/${encodeURIComponent(assetId)}`;
}

export function parseTokenDetailsAssetId(
  encodedAssetId: string | undefined
): SerializedCryptoAssetId | null {
  if (!encodedAssetId) return null;

  const upperPath = encodedAssetId.toUpperCase();
  if (upperPath === 'BTC') {
    return `${CryptoAssetProtocols.nativeBtc}|BTC` as SerializedCryptoAssetId;
  }
  if (upperPath === 'STX') {
    return `${CryptoAssetProtocols.nativeStx}|STX` as SerializedCryptoAssetId;
  }

  try {
    const assetId = decodeURIComponent(encodedAssetId) as SerializedCryptoAssetId;
    deserializeAssetId(assetId);
    return assetId;
  } catch {
    return null;
  }
}
