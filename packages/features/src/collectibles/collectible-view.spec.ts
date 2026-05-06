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

const stacksNft = {
  protocol: 'sip9',
  chain: 'stacks',
  category: 'nft',
  assetId: 'SP123.cool-nfts::nft',
  contractId: 'SP123.cool-nfts',
  tokenId: 7,
  name: 'Cool NFT #7',
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

  it('uses asset name as title for SIP-9 collectibles', () => {
    const view = createCollectibleView(stacksNft);
    expect(view.title).toBe('Cool NFT #7');
  });
});

describe(createCollectibleViews.name, () => {
  it('creates stable keys for each asset', () => {
    const views = createCollectibleViews([sip9, stacksNft]);
    const keys = new Set(views.map(view => view.key));
    expect(keys.size).toBe(2);
  });
});
