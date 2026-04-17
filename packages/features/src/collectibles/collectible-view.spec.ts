import { describe, expect, it } from 'vitest';

import { type NonFungibleCryptoAsset } from '@leather.io/models';

import { createCollectibleView, createCollectibleViews } from './collectible-view';

const inscription = {
  protocol: 'inscription',
  chain: 'bitcoin',
  category: 'nft',
  id: 'inscription',
  mimeType: 'image',
  number: 42,
  title: 'Ordinal #42',
  txid: 'txid',
  output: 'output',
  offset: '0',
  preview: 'preview',
  src: 'src',
  value: '0',
  address: 'address',
  genesisBlockHash: 'hash',
  genesisTimestamp: 0,
  genesisBlockHeight: 0,
} satisfies NonFungibleCryptoAsset;

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

describe(createCollectibleView.name, () => {
  it('formats inscription metadata', () => {
    const view = createCollectibleView(inscription);
    expect(view.title).toBe('# 42');
    expect(view.subtitle).toBe('Ordinal inscription');
  });

  it('marks BNS collectibles as special SIP-009 items', () => {
    const view = createCollectibleView(sip9);
    expect(view.isBns).toBe(true);
    expect(view.subtitle).toBe('Stacks collectible');
  });
});

describe(createCollectibleViews.name, () => {
  it('creates stable keys for each asset', () => {
    const views = createCollectibleViews([inscription, sip9]);
    const keys = new Set(views.map(view => view.key));
    expect(keys.size).toBe(2);
  });
});
