import { keys } from 'remeda';

import {
  type CryptoAsset,
  type CryptoAssetId,
  CryptoAssetProtocols,
  type Sip9Asset,
} from '@leather.io/models';

import { assertUnreachable } from '../assert-unreachable';

export function matchesAssetId(asset: CryptoAsset, assetId: CryptoAssetId) {
  const assetIdentifier = getAssetId(asset);
  return isSameAssetId(assetIdentifier, assetId);
}

export function isSameAssetId(assetId1: CryptoAssetId, assetId2: CryptoAssetId) {
  return assetId1.protocol === assetId2.protocol && assetId1.id === assetId2.id;
}

export function isSameAsset(asset1: CryptoAsset, asset2: CryptoAsset) {
  return isSameAssetId(getAssetId(asset1), getAssetId(asset2));
}

export function getAssetId(asset: CryptoAsset): CryptoAssetId {
  switch (asset.protocol) {
    case 'nativeBtc':
      return {
        protocol: 'nativeBtc',
        id: asset.symbol,
      };
    case 'nativeStx':
      return {
        protocol: 'nativeStx',
        id: asset.symbol,
      };
    case 'sip10':
      return {
        protocol: 'sip10',
        id: asset.assetId,
      };
    case 'sip9':
      return createSip9AssetId(asset);
    default:
      assertUnreachable(asset);
  }
}

export function createSip9AssetId(asset: Sip9Asset): CryptoAssetId {
  return {
    protocol: asset.protocol,
    id: formatSip9IdField(asset),
  };
}

export function formatSip9IdField(asset: Sip9Asset) {
  return `${asset.assetId}|${asset.tokenId}`;
}

export function parseSip9IdField(id: string) {
  const [assetId, tokenId] = id.split('|');
  return { assetId, tokenId: Number(tokenId) };
}

export type SerializedCryptoAssetId = `${string}|${string}`;

export function serializeAssetId(assetId: CryptoAssetId): SerializedCryptoAssetId {
  return `${assetId.protocol}|${assetId.id}`;
}

export function deserializeAssetId(serializedAssetId: SerializedCryptoAssetId): CryptoAssetId {
  const [serializedProtocol, ...idParts] = serializedAssetId.split('|');
  const id = idParts.join('|');
  const protocol = keys(CryptoAssetProtocols).find(key => key === serializedProtocol);
  if (!protocol) {
    throw new Error(`Unrecognized Asset Protocol: ${serializedProtocol}`);
  }

  return {
    protocol,
    id,
  };
}
