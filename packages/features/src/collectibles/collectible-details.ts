import { GAMMA_URL, HIRO_EXPLORER_URL } from '@leather.io/constants';
import type { Money, Sip9Asset, Sip9Attribute } from '@leather.io/models';

export function getGammaCollectionUrl(collectionExplorerUrl?: string | null): string | undefined {
  if (!collectionExplorerUrl) return undefined;
  return `${GAMMA_URL}${collectionExplorerUrl}`;
}

export function getHiroExplorerContractUrl(contractId?: string | null): string | undefined {
  if (!contractId) return undefined;
  return `${HIRO_EXPLORER_URL}/address/${contractId}`;
}

export interface Sip9Info {
  name?: string;
  description?: string;
  tokenId?: string | number;
  collectionName?: string;
  collectionUrl?: string;
  creator?: string;
  rarityRank?: number;
  totalItems?: number;
  contractUrl?: string;
  contentType?: string;
  attributes: Sip9Attribute[];
  floorPrice?: Money;
  latestSale?: Money;
}

export function getSip9Info(asset: Sip9Asset): Sip9Info {
  const collection = asset.collection;
  return {
    name: asset.name,
    description: asset.description,
    tokenId: asset.tokenId,
    collectionName: collection?.name,
    collectionUrl: getGammaCollectionUrl(collection?.collectionExplorerUrl),
    creator: asset.creator,
    rarityRank: asset.rarityRank,
    totalItems: collection?.totalItems,
    contractUrl: getHiroExplorerContractUrl(asset.contractId),
    contentType: asset.content?.contentType,
    attributes: filterSip9Attributes(asset.attributes),
    floorPrice: collection?.floorPrice,
    latestSale: collection?.latestSale,
  };
}

export function filterSip9Attributes(attributes?: Sip9Attribute[]): Sip9Attribute[] {
  if (!attributes) return [];
  return attributes.filter(attr => attr.traitType && attr.value && attr.value !== 'None');
}

export function formatAttributeValue(attribute: Sip9Attribute): string {
  if (attribute.rarityPercent) {
    return `${attribute.value} (${attribute.rarityPercent}%)`;
  }
  return String(attribute.value);
}

export const DESCRIPTION_TRUNCATE_LENGTH = 180;

export function truncateDescription(
  description: string,
  maxLength = DESCRIPTION_TRUNCATE_LENGTH
): { text: string; isTruncated: boolean } {
  if (description.length <= maxLength) {
    return { text: description, isTruncated: false };
  }
  return { text: `${description.slice(0, maxLength).trim()}…`, isTruncated: true };
}
