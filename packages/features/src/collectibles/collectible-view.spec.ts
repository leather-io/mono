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
  it('marks BNS v1 names as legacy BNS', () => {
    const view = createCollectibleView(sip9);
    expect(view.kind).toBe('legacy-bns');
    expect(view.subtitle).toBe('Legacy BNS');
  });

  it('marks BNS-V2 names as BNS names', () => {
    const view = createCollectibleView({
      ...sip9,
      assetId: 'SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2::BNS-V2',
      contractId: 'SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2',
    });
    expect(view.kind).toBe('bns');
    expect(view.subtitle).toBe('BNS name');
  });

  it('does not mark other contracts with a BNS-V2 asset name as BNS names', () => {
    const view = createCollectibleView({ ...sip9Generic, assetId: 'SP123.BNS-V2::BNS-V2' });
    expect(view.kind).toBe('nft');
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
