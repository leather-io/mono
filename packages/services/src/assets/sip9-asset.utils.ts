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
import { createMoney, createMoneyFromDecimal } from '@leather.io/utils';

import { gammaNftMetadataSchema } from '../infrastructure/api/gamma/gamma-api.schema';
import { HiroMetadata } from '../infrastructure/api/hiro/hiro-stacks-api.types';
import {
  transformHiroSip9Attributes,
  transformHiroSip9Collection,
} from '../infrastructure/api/hiro/hiro-stacks-api.utils';
import {
  getAssetNameFromIdentifier,
  getContractPrincipalFromAssetIdentifier,
} from './stacks-asset.utils';

export type GammaNftMetadata = z.infer<typeof gammaNftMetadataSchema>;

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

const leatherIpfsUrl = 'https://leather.quicknode-ipfs.com/ipfs/';

function encodeIpfsPath(path: string) {
  const normalized = path.replace(/^\/+/, '');
  if (!normalized) return '';
  return '/' + normalized.split('/').map(encodeURIComponent).join('/');
}

function toLeatherIpfsUrl(url: string): string {
  if (!url) return '';

  // Handle ipfs://<cid>/<path> and ipfs://ipfs/<cid>/<path>
  if (url.startsWith('ipfs://')) {
    const withoutScheme = url.replace(/^ipfs:\/\//, '');
    const withoutPrefix = withoutScheme.startsWith('ipfs/')
      ? withoutScheme.slice('ipfs/'.length)
      : withoutScheme;
    const [cid, ...rest] = withoutPrefix.split('/').filter(Boolean);
    if (!cid) return '';
    const encodedPath = encodeIpfsPath(rest.join('/'));
    return `${leatherIpfsUrl}${cid}${encodedPath}`;
  }

  // Handle https://.../ipfs/<cid>/<path>
  if (url.includes('/ipfs/')) {
    const ipfsPath = url.split('/ipfs/')[1];
    if (!ipfsPath) return '';

    const [cid, ...rest] = ipfsPath.split('/').filter(Boolean);
    if (!cid) return '';
    const encodedPath = encodeIpfsPath(rest.join('/'));
    return `${leatherIpfsUrl}${cid}${encodedPath}`;
  }

  return url;
}

export function createSip9Asset(
  assetIdentifier: string,
  tokenId: number,
  hiroMetadata?: HiroMetadata | null,
  gammaMetadata?: GammaNftMetadata | null
): Sip9Asset {
  const assetName = getAssetNameFromIdentifier(assetIdentifier);

  const name = gammaMetadata?.item.name || hiroMetadata?.name || assetName;

  const description = gammaMetadata?.item.description || hiroMetadata?.description || '';

  const gammaContentUrl = gammaMetadata?.item.asset_content?.content_url
    ? toLeatherIpfsUrl(gammaMetadata.item.asset_content.content_url)
    : undefined;

  const hiroContentUrl = toLeatherIpfsUrl(hiroMetadata?.cached_image || hiroMetadata?.image || '');

  const contentUrl = gammaContentUrl || hiroContentUrl || '';

  const contentType = gammaMetadata?.item.asset_content?.content_type || '';

  const collection =
    transformGammaCollection(gammaMetadata?.item.collection) ||
    transformHiroSip9Collection(hiroMetadata?.properties?.collection);

  const creator = gammaMetadata?.item.creator || hiroMetadata?.properties?.creator;
  const floorPrice =
    gammaMetadata?.item.collection?.floor_price_amount || hiroMetadata?.properties?.floor_price;
  const latestSale =
    gammaMetadata?.item.market_summary?.latest_sale?.price_amount ||
    hiroMetadata?.properties?.latest_sale;
  const attributes =
    transformGammaAttributes(gammaMetadata?.attribute_groups) ||
    transformHiroSip9Attributes(hiroMetadata?.attributes);
  const rarityRank = gammaMetadata?.item.rarity_rank || hiroMetadata?.properties?.rarity_rank;

  const resolvedCollection = collection
    ? {
        ...collection,
        floorPrice: createStxMoneyFromCollectionPriceAmount(floorPrice),
        latestSale: createStxMoneyFromCollectionPriceAmount(latestSale),
      }
    : undefined;

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
    collection: resolvedCollection,
    creator,
    attributes,
    rarityRank,
  };
}

interface CollectionPriceAmount {
  amount: number;
  unit: 'micro_stacks' | 'stx';
}

function createStxMoneyFromCollectionPriceAmount(priceAmount: CollectionPriceAmount | undefined) {
  if (!priceAmount) return undefined;
  const { amount, unit } = priceAmount;
  return unit === 'micro_stacks'
    ? createMoney(amount, 'STX')
    : createMoneyFromDecimal(amount, 'STX');
}
