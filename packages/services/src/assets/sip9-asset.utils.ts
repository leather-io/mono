import { hexToCV } from '@stacks/transactions';
import { z } from 'zod';

import {
  CryptoAssetCategories,
  CryptoAssetChains,
  CryptoAssetProtocols,
  Sip9Asset,
  Sip9AssetContent,
  Sip9Attribute,
  Sip9Collection,
  Sip9Details,
  SupportedSip9ContentType,
} from '@leather.io/models';

import { gammaNftMetadataSchema } from '../infrastructure/api/gamma/gamma-api.schema';
import {
  HiroMetadata,
  HiroNftMetadataResponse,
} from '../infrastructure/api/hiro/hiro-stacks-api.types';
import {
  transformHiroSip9Attributes,
  transformHiroSip9Collection,
} from '../infrastructure/api/hiro/hiro-stacks-api.utils';
import {
  getAssetNameFromIdentifier,
  getContractPrincipalFromAssetIdentifier,
} from './stacks-asset.utils';

type GammaNftMetadata = z.infer<typeof gammaNftMetadataSchema>;

function optionalize<A, R>(fn: (a: A) => R) {
  return (a: A | undefined): R | undefined => (a === undefined ? undefined : fn(a));
}

function transformGammaCollectionData(
  collection: GammaNftMetadata['item']['collection']
): Sip9Collection {
  return {
    name: collection.name,
    collectionExplorerUrl: collection.location_url,
    totalItems: collection.total_items,
  };
}

export const transformGammaCollection = optionalize(transformGammaCollectionData);

function transformGammaAttributesData(
  attributeGroups: GammaNftMetadata['attribute_groups']
): Sip9Attribute[] {
  return attributeGroups.flatMap(group =>
    group.attributes.map(attr => ({
      attributeTraitType: attr.label,
      attributeValue: attr.value,
      attributeRarityPercent: attr.rarity_percent_of_100,
    }))
  );
}

export const transformGammaAttributes = optionalize(transformGammaAttributesData);

function transformGammaAssetContentData(
  assetContent: GammaNftMetadata['item']['asset_content']
): Sip9AssetContent {
  return {
    contentUrl: assetContent.content_url,
    contentType: assetContent.content_type,
  };
}

export const transformGammaAssetContent = optionalize(transformGammaAssetContentData);

export function getNonFungibleTokenId(hex: string): number {
  const clarityValue = hexToCV(hex);
  return clarityValue.type === 'uint' ? Number(clarityValue.value) : 0;
}

export function transformToSip9Details(
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
    transformGammaCollection(gammaMetadata?.item.collection) ||
    transformHiroSip9Collection(hiroMetadata?.properties?.collection);

  const attributes =
    transformGammaAttributes(gammaMetadata?.attribute_groups) ||
    transformHiroSip9Attributes(hiroMetadata?.attributes);

  return {
    id: gammaMetadata?.item.id,
    name,
    description,
    assetContent: transformGammaAssetContent(gammaMetadata?.item.asset_content),
    cachedImage,
    cachedImageThumbnail,
    contentType,
    collection,
    attributes,
  };
}

export function createSip9Asset(
  assetIdentifier: string,
  tokenId: number,
  metadata: HiroNftMetadataResponse | null,
  gammaMetadata?: GammaNftMetadata | null
): Sip9Asset {
  const details = transformToSip9Details(assetIdentifier, gammaMetadata, metadata?.metadata);

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
