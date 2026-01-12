import { ORD_IO_URL } from '@leather.io/constants';
import type {
  BitcoinNetwork,
  InscriptionAsset,
  Sip9Asset,
  Sip9Attribute,
  StampAsset,
} from '@leather.io/models';

import { getBitcoinExplorerLink } from '../activity/activity-links';

/**
 * Get the ord.io explorer URL for an inscription
 */
export function getOrdExplorerUrl(inscriptionNumber?: number): string | undefined {
  if (!inscriptionNumber) return undefined;
  return `${ORD_IO_URL}/${inscriptionNumber}`;
}

/**
 * Get the Gamma explorer URL for a SIP-9 collection
 */
export function getGammaCollectionUrl(collectionExplorerUrl?: string | null): string | undefined {
  if (!collectionExplorerUrl) return undefined;
  return `https://gamma.io${collectionExplorerUrl}`;
}

/**
 * Get the Hiro Explorer URL for a contract address
 */
export function getHiroExplorerContractUrl(contractId?: string | null): string | undefined {
  if (!contractId) return undefined;
  return `https://explorer.hiro.so/address/${contractId}`;
}

/**
 * Information extracted from an inscription for display
 */
export interface InscriptionInfo {
  title?: string;
  ordExplorerUrl?: string;
  txExplorerUrl?: string | null;
  genesisTimestamp?: number;
  genesisBlockHeight?: number;
  mimeType?: string;
  outputValue?: string;
}

/**
 * Extract display information from an inscription asset
 */
export function getInscriptionInfo(
  asset: InscriptionAsset,
  bitcoinNetwork: BitcoinNetwork
): InscriptionInfo {
  return {
    title: asset.title,
    ordExplorerUrl: getOrdExplorerUrl(asset.number),
    txExplorerUrl: asset.txid
      ? getBitcoinExplorerLink({
          id: asset.txid,
          type: 'tx',
          networkPreference: bitcoinNetwork,
        })
      : undefined,
    genesisTimestamp: asset.genesisTimestamp,
    genesisBlockHeight: asset.genesisBlockHeight,
    mimeType: asset.mimeType,
    outputValue: asset.value,
  };
}

/**
 * Information extracted from a SIP-9 asset for display
 */
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
}

/**
 * Extract display information from a SIP-9 asset
 */
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
  };
}

/**
 * Filter SIP-9 attributes to only include valid, displayable ones.
 * Excludes attributes with missing trait types, values, or "None" values.
 */
export function filterSip9Attributes(attributes?: Sip9Attribute[]): Sip9Attribute[] {
  if (!attributes) return [];
  return attributes.filter(attr => attr.traitType && attr.value && attr.value !== 'None');
}

/**
 * Format a SIP-9 attribute value, optionally including rarity percentage
 */
export function formatAttributeValue(attribute: Sip9Attribute): string {
  if (attribute.rarityPercent) {
    return `${attribute.value} (${attribute.rarityPercent}%)`;
  }
  return String(attribute.value);
}

/**
 * Information extracted from a stamp asset for display
 */
export interface StampInfo {
  name: string;
  stampExplorerUrl?: string;
  blockExplorerUrl?: string | null;
  blockHeight?: number;
}

/**
 * Extract display information from a stamp asset
 */
export function getStampInfo(asset: StampAsset, bitcoinNetwork: BitcoinNetwork): StampInfo {
  return {
    name: `Stamp #${asset.stamp}`,
    stampExplorerUrl: asset.stampExplorerUrl,
    blockExplorerUrl: asset.blockHeight
      ? getBitcoinExplorerLink({
          id: asset.blockHeight.toString(),
          type: 'block',
          networkPreference: bitcoinNetwork,
        })
      : undefined,
    blockHeight: asset.blockHeight,
  };
}

/**
 * Maximum length before description should be truncated
 */
export const DESCRIPTION_TRUNCATE_LENGTH = 180;

/**
 * Truncate a description string for display
 */
export function truncateDescription(
  description: string,
  maxLength = DESCRIPTION_TRUNCATE_LENGTH
): { text: string; isTruncated: boolean } {
  if (description.length <= maxLength) {
    return { text: description, isTruncated: false };
  }
  return { text: `${description.slice(0, maxLength).trim()}…`, isTruncated: true };
}
