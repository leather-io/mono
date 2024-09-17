import { mockCollectibles } from '@leather.io/ui/native';

import { serializeCollectibles } from './collectibles-serializer';

describe('serializeCollectibles', () => {
  it('should correctly serialize collectibles', () => {
    const serializedCollectibles = serializeCollectibles(mockCollectibles);

    expect(serializedCollectibles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          imageUrl: expect.any(String),
          collection: expect.any(String),
          type: expect.stringMatching(/^(ordinal|stacks)$/),
        }),
      ])
    );
  });

  it('should handle empty input', () => {
    const serializedCollectibles = serializeCollectibles([]);
    expect(serializedCollectibles).toEqual([]);
  });

  it('should correctly serialize Ordinals', () => {
    const ordinals = mockCollectibles.filter(c => 'name' in c && 'mimeType' in c);
    const serializedOrdinals = serializeCollectibles(ordinals);

    serializedOrdinals.forEach(ordinal => {
      expect(ordinal).toEqual(
        expect.objectContaining({
          type: 'inscription',
          id: expect.any(String),
          title: expect.any(String),
          imageUrl: expect.any(String),
          collection: expect.any(String),
        })
      );
    });
  });

  it('should correctly serialize StacksNfts', () => {
    const stacksNfts = mockCollectibles.filter(c => 'metadata' in c);
    const serializedStacksNfts = serializeCollectibles(stacksNfts);

    serializedStacksNfts.forEach(nft => {
      expect(nft).toEqual(
        expect.objectContaining({
          type: 'stacks',
          id: expect.any(String),
          title: expect.any(String),
          imageUrl: expect.any(String),
          collection: expect.any(String),
        })
      );
    });
  });
});
