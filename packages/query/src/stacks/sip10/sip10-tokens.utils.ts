import type { FtMetadataResponse } from '@hirosystems/token-metadata-api-client';

import {
  CryptoAssetCategories,
  CryptoAssetChains,
  CryptoAssetProtocols,
  type Sip10Asset,
} from '@leather.io/models';
import { getStacksAssetStringParts } from '@leather.io/stacks';
import { getTicker, isUndefined } from '@leather.io/utils';

export function isTransferableSip10Token(token: Partial<FtMetadataResponse>) {
  return !isUndefined(token.decimals) && !isUndefined(token.name) && !isUndefined(token.symbol);
}

export function createSip10Asset(key: string, ftAsset: FtMetadataResponse): Sip10Asset {
  const { contractAssetName } = getStacksAssetStringParts(key);
  const name = ftAsset.name || contractAssetName;

  return {
    chain: CryptoAssetChains.stacks,
    category: CryptoAssetCategories.fungible,
    protocol: CryptoAssetProtocols.sip10,
    canTransfer: isTransferableSip10Token(ftAsset),
    assetId: key,
    contractId: key,
    decimals: ftAsset.decimals ?? 0,
    hasMemo: isTransferableSip10Token(ftAsset),
    imageCanonicalUri: ftAsset.image_canonical_uri ?? '',
    name,
    symbol: ftAsset.symbol || getTicker(name),
  };
}

export type Sip10AssetFilter = 'all' | 'supported' | 'unsupported';
