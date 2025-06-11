import { hexToCV } from '@stacks/transactions';

import {
  CryptoAssetCategories,
  CryptoAssetChains,
  CryptoAssetProtocols,
  Sip9Asset,
  Sip10Asset,
} from '@leather.io/models';
import { getTicker, isUndefined } from '@leather.io/utils';

import { HiroNftMetadataResponse } from '../infrastructure/api/hiro/hiro-stacks-api.types';
import { LeatherApiSip10Token } from '../infrastructure/api/leather/leather-api.client';

export function isTransferableSip10Token(token: LeatherApiSip10Token) {
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

export function createSip9Asset(
  assetIdentifier: string,
  tokenId: number,
  { metadata }: HiroNftMetadataResponse
): Sip9Asset {
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

export function createSip10Asset(sip10Token: LeatherApiSip10Token): Sip10Asset {
  const assetName = getAssetNameFromIdentifier(sip10Token.assetIdentifier);
  const name = sip10Token.name ?? assetName;

  return {
    chain: CryptoAssetChains.stacks,
    category: CryptoAssetCategories.fungible,
    protocol: CryptoAssetProtocols.sip10,
    canTransfer: isTransferableSip10Token(sip10Token),
    assetId: sip10Token.assetIdentifier,
    contractId: sip10Token.principal,
    decimals: sip10Token.decimals ?? 0,
    hasMemo: isTransferableSip10Token(sip10Token),
    imageCanonicalUri: sip10Token.image ?? '',
    name,
    symbol: sip10Token.symbol || getTicker(name),
  };
}
