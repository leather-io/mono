import {
  CryptoAssetCategories,
  CryptoAssetChains,
  CryptoAssetProtocols,
  Sip10CryptoAssetInfo,
} from '@leather.io/models';
import { getTicker, isUndefined } from '@leather.io/utils';

import { HiroFtMetadataResponse } from '../infrastructure/api/hiro/hiro-stacks-api.client';

export function isTransferableSip10Token(token: Partial<HiroFtMetadataResponse>) {
  return !isUndefined(token.decimals) && !isUndefined(token.name) && !isUndefined(token.symbol);
}

export function getAssetNameFromIdentifier(assetIdentifier: string) {
  return !assetIdentifier.includes('::') ? assetIdentifier : assetIdentifier.split('::')[1];
}

export function getContractPrincipalFromAssetIdentifier(assetIdentifier: string) {
  return assetIdentifier.split('::')[0];
}

export function getAddressFromAssetIdentifier(assetIdentifier: string) {
  const principal = getContractPrincipalFromAssetIdentifier(assetIdentifier);
  return principal.split('.')[0];
}

export function createSip10CryptoAssetInfo(
  assetIdentifier: string,
  metadata: HiroFtMetadataResponse
): Sip10CryptoAssetInfo {
  const assetName = getAssetNameFromIdentifier(assetIdentifier);
  const name = metadata.name || assetName;

  return {
    chain: CryptoAssetChains.stacks,
    category: CryptoAssetCategories.fungible,
    protocol: CryptoAssetProtocols.sip10,
    canTransfer: isTransferableSip10Token(metadata),
    contractId: getContractPrincipalFromAssetIdentifier(assetIdentifier),
    decimals: metadata.decimals ?? 0,
    hasMemo: isTransferableSip10Token(metadata),
    imageCanonicalUri: metadata.image_canonical_uri ?? '',
    name,
    symbol: metadata?.symbol || getTicker(name),
  };
}
