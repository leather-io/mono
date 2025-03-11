import { hexToCV } from '@stacks/transactions';

import {
  CryptoAssetCategories,
  CryptoAssetChains,
  CryptoAssetProtocols,
  Sip9CryptoAssetInfo,
  Sip10CryptoAssetInfo,
} from '@leather.io/models';
import { getTicker, isUndefined } from '@leather.io/utils';

import {
  HiroFtMetadataResponse,
  HiroNftMetadataResponse,
} from '../infrastructure/api/hiro/hiro-stacks-api.client';

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

export function getAssetIdentifierFromContract(
  contractAddress: string,
  contractName: string,
  assetName: string
) {
  return `${contractAddress}.${contractName}::${assetName}`;
}

export function getContractPrincipalFromAddressAndName(
  contractAddress: string,
  contractName: string
) {
  return `${contractAddress}.${contractName}`;
}

export function getNonFungibleTokenId(hex: string): number {
  const clarityValue = hexToCV(hex);
  return clarityValue.type === 'uint' ? Number(clarityValue.value) : 0;
}

export function createSip9CryptoAssetInfo(
  assetIdentifier: string,
  tokenId: number,
  { metadata }: HiroNftMetadataResponse
): Sip9CryptoAssetInfo {
  const assetName = getAssetNameFromIdentifier(assetIdentifier);
  return {
    chain: CryptoAssetChains.stacks,
    category: CryptoAssetCategories.nft,
    protocol: CryptoAssetProtocols.sip9,
    assetId: assetIdentifier,
    contractId: getContractPrincipalFromAssetIdentifier(assetIdentifier),
    tokenId,
    collection: (metadata?.properties as any)?.collection ?? '',
    name: metadata?.name ?? assetName,
    description: metadata?.description ?? '',
    cachedImage: metadata?.cached_image ?? '',
    cachedImageThumbnail: (metadata as any)?.cached_thumbnail_image ?? '',
  };
}

export function createSip10CryptoAssetInfo(
  assetIdentifier: string,
  metadata: HiroFtMetadataResponse
): Sip10CryptoAssetInfo {
  const assetName = getAssetNameFromIdentifier(assetIdentifier);
  const name = metadata.name ?? assetName;

  return {
    chain: CryptoAssetChains.stacks,
    category: CryptoAssetCategories.fungible,
    protocol: CryptoAssetProtocols.sip10,
    canTransfer: isTransferableSip10Token(metadata),
    assetId: assetIdentifier,
    contractId: getContractPrincipalFromAssetIdentifier(assetIdentifier),
    decimals: metadata.decimals ?? 0,
    hasMemo: isTransferableSip10Token(metadata),
    imageCanonicalUri: metadata.image_canonical_uri ?? '',
    name,
    symbol: metadata.symbol || getTicker(name),
  };
}
