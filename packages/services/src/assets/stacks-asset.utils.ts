import { hexToCV } from '@stacks/transactions';

import {
  CryptoAssetCategories,
  CryptoAssetChains,
  CryptoAssetProtocols,
  Sip9Asset,
  Sip9Details,
  Sip10Asset,
  SupportedSip9ContentType,
} from '@leather.io/models';
import { getTicker, isUndefined } from '@leather.io/utils';

import { GammaNftMetadata } from '../infrastructure/api/gamma/gamma-api.client';
import {
  mapGammaAssetContent,
  mapGammaAttributes,
  mapGammaCollection,
  mapGammaOwner,
} from '../infrastructure/api/gamma/gamma-api.utils';
import {
  HiroMetadata,
  HiroNftMetadataResponse,
} from '../infrastructure/api/hiro/hiro-stacks-api.types';
import {
  mapHiroAttributes,
  mapHiroCollection,
} from '../infrastructure/api/hiro/hiro-stacks-api.utils';
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

export function mapToSip9Details(
  assetIdentifier: string,
  gammaMetadata?: GammaNftMetadata | null,
  hiroMetadata?: HiroMetadata | null
): Sip9Details {
  const assetName = getAssetNameFromIdentifier(assetIdentifier);

  // Prioritize Gamma, fallback to Hiro
  const name = gammaMetadata?.item.name || hiroMetadata?.name || assetName;

  const description = gammaMetadata?.item.description || hiroMetadata?.description || '';

  const cachedImage =
    gammaMetadata?.item.asset_content?.content_url ||
    hiroMetadata?.cached_image ||
    hiroMetadata?.image ||
    '';

  const cachedImageThumbnail =
    gammaMetadata?.item.asset_content?.content_url ||
    (hiroMetadata as any)?.cached_thumbnail_image ||
    hiroMetadata?.cached_image ||
    '';

  const contentType = (gammaMetadata?.item.asset_content?.content_type ||
    '') as SupportedSip9ContentType;

  const collection =
    mapGammaCollection(gammaMetadata?.item.collection) ||
    mapHiroCollection(hiroMetadata?.properties?.collection);

  const owner = mapGammaOwner(gammaMetadata?.item.owner);

  const attributes =
    mapGammaAttributes(gammaMetadata?.attribute_groups) ||
    mapHiroAttributes(hiroMetadata?.attributes);

  return {
    id: gammaMetadata?.item.id,
    name,
    description,
    assetContent: mapGammaAssetContent(gammaMetadata?.item.asset_content),
    cachedImage,
    cachedImageThumbnail,
    contentType,
    locationUrl: gammaMetadata?.item.location_url,
    collection,
    owner,
    attributes,
    rarityRank: gammaMetadata?.item.rarity_rank,
  };
}

// export function createSip9Asset(
//   assetIdentifier: string,
//   tokenId: number,
//   metadata: HiroNftMetadataResponse | null,
//   gammaMetadata?: GammaNftMetadata | null
// ): Sip9Asset {
//   const assetName = getAssetNameFromIdentifier(assetIdentifier);
//   const { metadata: hiroMetadata } = metadata || {};
//   const name = hiroMetadata?.name || gammaMetadata?.item.name || assetName;
//   const description = hiroMetadata?.description || gammaMetadata?.item.description || '';
//   const cachedImage =
//     hiroMetadata?.cached_image || gammaMetadata?.item.asset_content?.content_url || '';
//   const cachedImageThumbnail =
//     (hiroMetadata as any)?.cached_thumbnail_image ||
//     gammaMetadata?.item.asset_content?.content_url ||
//     '';
//   const contentType =
//     gammaMetadata?.item.asset_content?.content_type || ('' as SupportedSip9ContentType);
//   const collection = mapToSip9Collection(
//     gammaMetadata?.item.collection,
//     hiroMetadata?.properties?.collection
//   );

//   return {
//     chain: CryptoAssetChains.stacks,
//     category: CryptoAssetCategories.nft,
//     protocol: CryptoAssetProtocols.sip9,
//     assetId: assetIdentifier,
//     contractId: getContractPrincipalFromAssetIdentifier(assetIdentifier),
//     tokenId,
//     name,
//     description,
//     cachedImage,
//     cachedImageThumbnail,
//     contentType: contentType as SupportedSip9ContentType,
//     collection,
//   };
// }

// Simplified createSip9Asset function
export function createSip9Asset(
  assetIdentifier: string,
  tokenId: number,
  metadata: HiroNftMetadataResponse | null,
  gammaMetadata?: GammaNftMetadata | null
): Sip9Asset {
  const details = mapToSip9Details(assetIdentifier, gammaMetadata, metadata?.metadata);

  return {
    chain: CryptoAssetChains.stacks,
    category: CryptoAssetCategories.nft,
    protocol: CryptoAssetProtocols.sip9,
    assetId: assetIdentifier,
    contractId: getContractPrincipalFromAssetIdentifier(assetIdentifier),
    tokenId,
    name: details.name,
    description: details.description,
    cachedImage: details.cachedImage,
    cachedImageThumbnail: details.cachedImageThumbnail,
    contentType: details.contentType,
    details,
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
