import { describe, expect, it } from 'vitest';

import { type NonFungibleCryptoAsset } from '@leather.io/models';

import { createCollectibleView, createCollectibleViews } from './collectible-view';

const sip9 = {
  protocol: 'sip9',
  chain: 'stacks',
  category: 'nft',
  assetId: 'SP000000000000000000002Q6VF78.bns::names',
  contractId: 'SP000000000000000000002Q6VF78.bns',
  tokenId: 1,
  name: 'BNS Name',
  description: '',
  content: {
    contentUrl: 'https://example.com',
    contentType: 'image/png',
  },
} satisfies NonFungibleCryptoAsset;

const sip9Generic = {
  protocol: 'sip9',
  chain: 'stacks',
  category: 'nft',
  assetId: 'SP123.test::nft',
  contractId: 'SP123.test',
  tokenId: 42,
  name: 'Test NFT',
  description: '',
  content: {
    contentUrl: 'https://example.com',
    contentType: 'image/png',
  },
} satisfies NonFungibleCryptoAsset;

describe(createCollectibleView.name, () => {
  it('marks BNS collectibles as special SIP-009 items', () => {
    const view = createCollectibleView(sip9);
    expect(view.isBns).toBe(true);
    expect(view.subtitle).toBe('Stacks collectible');
  });

  it('falls back to a generic title for non-BNS sip9 items without a name', () => {
    const view = createCollectibleView({ ...sip9Generic, name: '' });
    expect(view.title).toBe('nft');
  });
});

describe(createCollectibleViews.name, () => {
  it('creates stable keys for each asset', () => {
    const views = createCollectibleViews([sip9, sip9Generic]);
    const keys = new Set(views.map(view => view.key));
    expect(keys.size).toBe(2);
  });
});
