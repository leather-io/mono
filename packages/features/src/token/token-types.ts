import { isIncludedIn } from 'remeda';

import { type CryptoAssetProtocol, CryptoAssetProtocols } from '@leather.io/models';
import { type SerializedCryptoAssetId, deserializeAssetId } from '@leather.io/utils';

const supportedAssetProtocols = ['nativeBtc', 'nativeStx', 'sip10', 'sip9'] as const;

const supportedFungibleAssetProtocols = ['nativeBtc', 'nativeStx', 'sip10'] as const;

const supportedNonFungibleAssetProtocols = ['sip9'] as const;

export type SupportedAssetProtocol = (typeof supportedAssetProtocols)[number];
export type SupportedFungibleAssetProtocol = (typeof supportedFungibleAssetProtocols)[number];
export type SupportedNonFungibleAssetProtocol = (typeof supportedNonFungibleAssetProtocols)[number];

export function isSupportedFungibleAssetProtocol(value: CryptoAssetProtocol) {
  return isIncludedIn(value, supportedFungibleAssetProtocols);
}

export function isSupportedNonFungibleAssetProtocol(value: CryptoAssetProtocol) {
  return isIncludedIn(value, supportedNonFungibleAssetProtocols);
}

export function isSupportedAssetProtocol(value: CryptoAssetProtocol) {
  return isIncludedIn(value, supportedAssetProtocols);
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

function toSerializedAssetId(value: string): SerializedCryptoAssetId | null {
  const separatorIndex = value.indexOf('|');
  if (separatorIndex === -1) return null;
  return `${value.slice(0, separatorIndex)}|${value.slice(separatorIndex + 1)}`;
}

export function parseTokenDetailsAssetId(
  encodedAssetId: string | undefined
): SerializedCryptoAssetId | null {
  if (!encodedAssetId) return null;

  const upperPath = encodedAssetId.toUpperCase();
  if (upperPath === 'BTC') {
    return `${CryptoAssetProtocols.nativeBtc}|BTC`;
  }
  if (upperPath === 'STX') {
    return `${CryptoAssetProtocols.nativeStx}|STX`;
  }

  try {
    const assetId = toSerializedAssetId(decodeURIComponent(encodedAssetId));
    if (!assetId) return null;
    deserializeAssetId(assetId);
    return assetId;
  } catch {
    return null;
  }
}
