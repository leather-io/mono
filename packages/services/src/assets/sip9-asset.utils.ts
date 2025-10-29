import { hexToCV } from '@stacks/transactions';
import { z } from 'zod';

import {
  CryptoAssetCategories,
  CryptoAssetChains,
  CryptoAssetProtocols,
  Sip9Asset,
  Sip9Attribute,
  Sip9Collection,
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

const transformGammaCollection = optionalize(transformGammaCollectionData);

function transformGammaAttributesData(
  attributeGroups: GammaNftMetadata['attribute_groups']
): Sip9Attribute[] {
  return attributeGroups.flatMap(group =>
    group.attributes.map(attr => ({
      traitType: attr.label,
      value: attr.value,
      rarityPercent: attr.rarity_percent_of_100,
    }))
  );
}

const transformGammaAttributes = optionalize(transformGammaAttributesData);

export function getNonFungibleTokenId(hex: string): number {
  const clarityValue = hexToCV(hex);
  return clarityValue.type === 'uint' ? Number(clarityValue.value) : 0;
}

export function createSip9Asset(
  assetIdentifier: string,
  tokenId: number,
  hiroMetadata: HiroMetadata | null,
  gammaMetadata?: GammaNftMetadata | null
): Sip9Asset {
  const assetName = getAssetNameFromIdentifier(assetIdentifier);

  const name = gammaMetadata?.item.name || hiroMetadata?.name || assetName;

  const description = gammaMetadata?.item.description || hiroMetadata?.description || '';

  const contentUrl =
    gammaMetadata?.item.asset_content?.content_url ||
    hiroMetadata?.cached_image ||
    hiroMetadata?.image ||
    '';

  const contentType = gammaMetadata?.item.asset_content?.content_type || '';

  const collection =
    transformGammaCollection(gammaMetadata?.item.collection) ||
    transformHiroSip9Collection(hiroMetadata?.properties?.collection);

  const creator = gammaMetadata?.item.creator || hiroMetadata?.properties?.creator;
  const floorPrice =
    gammaMetadata?.item.collection?.floor_price_amount || hiroMetadata?.properties?.floor_price;

  const attributes =
    transformGammaAttributes(gammaMetadata?.attribute_groups) ||
    transformHiroSip9Attributes(hiroMetadata?.attributes);

  return {
    chain: CryptoAssetChains.stacks,
    category: CryptoAssetCategories.nft,
    protocol: CryptoAssetProtocols.sip9,
    assetId: assetIdentifier,
    contractId: getContractPrincipalFromAssetIdentifier(assetIdentifier),
    tokenId,
    name,
    description,
    content: {
      contentUrl,
      contentType,
    },
    collection,
    creator,
    floorPrice,
    attributes,
  };
}
