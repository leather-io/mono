import {
  BnsNameAsset,
  CryptoAsset,
  CryptoAssetId,
  CryptoAssetProtocol,
  CryptoAssetProtocols,
  Sip9Asset,
} from '@leather.io/models';

import { assertUnreachable } from '../index';

export function matchesAssetId(asset: CryptoAsset, assetId: CryptoAssetId) {
  return getAssetId(asset).protocol === assetId.protocol && getAssetId(asset).id === assetId.id;
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
    case 'rune':
      return {
        protocol: 'rune',
        id: asset.runeName,
      };
    case 'brc20':
      return {
        protocol: 'brc20',
        id: asset.symbol,
      };
    case 'src20':
      return {
        protocol: 'src20',
        id: asset.id,
      };
    case 'stx20':
      return {
        protocol: 'stx20',
        id: asset.symbol,
      };
    case 'inscription':
      return {
        protocol: 'inscription',
        id: asset.id,
      };
    case 'stamp':
      return {
        protocol: 'stamp',
        id: asset.stamp.toString(),
      };
    case 'sip9':
      return buildSip9AssetId(asset);
    default:
      assertUnreachable(asset);
  }
}

function buildSip9AssetId(asset: Sip9Asset | BnsNameAsset): CryptoAssetId {
  // BNS SIP-9's have a namespace and name
  if ('namespace' in asset) {
    return {
      protocol: asset.protocol,
      id: `${asset.name}|${asset.namespace}`,
    };
  }

  return {
    protocol: asset.protocol,
    id: `${asset.assetId}|${asset.tokenId}`,
  };
}

export type SerializedCryptoAssetId = `${string}|${string}`;

export function serializeAssetId(assetId: CryptoAssetId): SerializedCryptoAssetId {
  return `${assetId.protocol}|${assetId.id}`;
}

export function deserializeAssetId(serializedAssetId: SerializedCryptoAssetId): CryptoAssetId {
  const [protocol, id] = serializedAssetId.split('|');
  if (!Object.keys(CryptoAssetProtocols).includes(protocol)) {
    throw new Error(`Unrecognized Asset Protocol: ${protocol}`);
  }
  return {
    protocol: protocol as CryptoAssetProtocol,
    id,
  };
}
