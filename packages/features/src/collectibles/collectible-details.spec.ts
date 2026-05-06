import { describe, expect, it } from 'vitest';

import { GAMMA_URL, HIRO_EXPLORER_URL } from '@leather.io/constants';
import type { Sip9Asset, Sip9Attribute } from '@leather.io/models';

import {
  DESCRIPTION_TRUNCATE_LENGTH,
  filterSip9Attributes,
  formatAttributeValue,
  getGammaCollectionUrl,
  getHiroExplorerContractUrl,
  getSip9Info,
  truncateDescription,
} from './collectible-details';

describe('getGammaCollectionUrl', () => {
  it('returns undefined when no URL provided', () => {
    expect(getGammaCollectionUrl()).toBeUndefined();
    expect(getGammaCollectionUrl(null)).toBeUndefined();
  });

  it('returns gamma URL with path', () => {
    expect(getGammaCollectionUrl('/collection/test')).toBe(`${GAMMA_URL}/collection/test`);
  });
});

describe('getHiroExplorerContractUrl', () => {
  it('returns undefined when no contract provided', () => {
    expect(getHiroExplorerContractUrl()).toBeUndefined();
    expect(getHiroExplorerContractUrl(null)).toBeUndefined();
  });

  it('returns Hiro explorer URL', () => {
    expect(getHiroExplorerContractUrl('SP123.test')).toBe(
      `${HIRO_EXPLORER_URL}/address/SP123.test`
    );
  });
});

describe('filterSip9Attributes', () => {
  it('returns empty array for undefined', () => {
    expect(filterSip9Attributes(undefined)).toEqual([]);
  });

  it('filters out invalid attributes', () => {
    const attrs: Sip9Attribute[] = [
      { traitType: 'Color', value: 'Red' },
      { traitType: '', value: 'Blue' },
      { traitType: 'Size', value: '' },
      { traitType: 'Style', value: 'None' },
      { traitType: 'Valid', value: 'Yes' },
    ];

    const result = filterSip9Attributes(attrs);
    expect(result).toHaveLength(2);
    expect(result[0].traitType).toBe('Color');
    expect(result[1].traitType).toBe('Valid');
  });
});

describe('formatAttributeValue', () => {
  it('returns value without rarity when not present', () => {
    expect(formatAttributeValue({ traitType: 'Color', value: 'Red' })).toBe('Red');
  });

  it('includes rarity percentage when present', () => {
    expect(formatAttributeValue({ traitType: 'Color', value: 'Red', rarityPercent: 5.5 })).toBe(
      'Red (5.5%)'
    );
  });
});

describe('truncateDescription', () => {
  it('does not truncate short text', () => {
    const { text, isTruncated } = truncateDescription('Short text');
    expect(text).toBe('Short text');
    expect(isTruncated).toBe(false);
  });

  it('truncates long text with ellipsis', () => {
    const longText = 'a'.repeat(DESCRIPTION_TRUNCATE_LENGTH + 50);
    const { text, isTruncated } = truncateDescription(longText);
    expect(text.length).toBe(DESCRIPTION_TRUNCATE_LENGTH + 1); // +1 for ellipsis
    expect(text.endsWith('…')).toBe(true);
    expect(isTruncated).toBe(true);
  });

  it('respects custom max length', () => {
    const { text, isTruncated } = truncateDescription('Hello World', 5);
    expect(text).toBe('Hello…');
    expect(isTruncated).toBe(true);
  });
});

describe('getSip9Info', () => {
  it('extracts SIP-9 info correctly', () => {
    const asset = {
      chain: 'stacks',
      protocol: 'sip9',
      assetId: 'SP123.test::nft',
      category: 'image',
      name: 'Test NFT',
      description: 'A test NFT',
      tokenId: 1,
      contractId: 'SP123.test',
      creator: 'SP456',
      rarityRank: 10,
      collection: {
        name: 'Test Collection',
        collectionExplorerUrl: '/collection/test',
        totalItems: 100,
      },
      content: {
        contentUrl: 'https://example.com/image.png',
        contentType: 'image/png',
      },
      attributes: [{ traitType: 'Color', value: 'Red' }],
    } as unknown as Sip9Asset;

    const info = getSip9Info(asset);
    expect(info.name).toBe('Test NFT');
    expect(info.description).toBe('A test NFT');
    expect(info.collectionName).toBe('Test Collection');
    expect(info.collectionUrl).toContain('gamma.io');
    expect(info.contractUrl).toContain('explorer.hiro.so');
    expect(info.attributes).toHaveLength(1);
  });
});
