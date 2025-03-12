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
import { createSip10ImageCanonicalUri } from './sip10-asset.utils';
import { alexTokenData } from './sip10-consts';

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
  { metadata }: HiroNftMetadataResponse
): Sip9CryptoAssetInfo {
  const assetName = getAssetNameFromIdentifier(assetIdentifier);
  return {
    chain: CryptoAssetChains.stacks,
    category: CryptoAssetCategories.nft,
    protocol: CryptoAssetProtocols.sip9,
    assetId: assetIdentifier,
    contractId: getContractPrincipalFromAssetIdentifier(assetIdentifier),
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
    imageCanonicalUri: createSip10ImageCanonicalUri({ metadata, assetName }),
    name,
    symbol: metadata.symbol || getTicker(name),
  };
}

interface Sip10ImageCanonicalUriArgs {
  metadata: HiroFtMetadataResponse;
  assetName: string;
}
export function createSip10ImageCanonicalUri({
  metadata,
  assetName,
}: Sip10ImageCanonicalUriArgs): string {
  if (isUndefined(metadata.image_canonical_uri) || metadata.image_canonical_uri === '') {
    const tokenInfoFromAlexLabs = alexTokenData.find(({ name }) => assetName === name);

    console.log(
      'createSip10ImageCanonicalUri metadata',
      metadata.image_canonical_uri,
      assetName,
      tokenInfoFromAlexLabs?.icon
    );
    return tokenInfoFromAlexLabs?.icon ?? '';
  }
  return metadata.image_canonical_uri;
}
// TODO: use this to fetch data from alex lab once determined where to call it from
export async function fetchDataFromAlexLab(signal?: AbortSignal): Promise<any> {
  const alexLabsSip10Api = `https://alex-sdk-api.alexlab.co/`;
  const response = await fetch(alexLabsSip10Api, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch data from Alex Lab API: ${response.statusText}`);
  }
  return response.json();
}
