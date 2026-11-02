import type { Sip9Asset } from '@leather.io/models';

export function createTestSip9Asset(overrides: Partial<Sip9Asset> = {}): Sip9Asset {
  return {
    chain: 'stacks',
    category: 'nft',
    protocol: 'sip9',
    assetId: '',
    contractId: '',
    tokenId: 0,
    name: '',
    description: '',
    content: { contentUrl: '', contentType: '' },
    ...overrides,
  };
}
