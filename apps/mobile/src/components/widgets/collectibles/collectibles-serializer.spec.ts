import { serializeCollectibles } from './collectibles-serializer';
import { mockCollectibles } from './collectibles.mocks';
import {
  formatInsciptionName,
  isValidInscription,
  isValidSip9,
  isValidStamp,
} from './collectibles.utils';

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

describe('isValidInscription', () => {
  it('should return true for valid inscriptions', () => {
    const inscription = mockCollectibles.find(c => c.protocol === 'inscription');
    if (!inscription) throw new Error('No inscription found in test data');
    expect(isValidInscription(inscription)).toBe(true);
  });
});

describe('isValidSip9', () => {
  it('should return true for valid sip9s', () => {
    const sip9 = mockCollectibles.find(c => c.protocol === 'sip9');
    if (!sip9) throw new Error('No sip9 found in test data');
    expect(isValidSip9(sip9)).toBe(true);
  });
});

describe('isValidStamp', () => {
  it('should return true for valid stamps', () => {
    const stamp = mockCollectibles.find(c => c.protocol === 'stamp');
    if (!stamp) throw new Error('No stamp found in test data');
    expect(isValidStamp(stamp)).toBe(true);
  });
});

describe('formatInsciptionName', () => {
  it('should replace "Inscription" with "#" in the name', () => {
    expect(formatInsciptionName('Inscription 123')).toBe('# 123');
    expect(formatInsciptionName('My Inscription 456')).toBe('My # 456');
    expect(formatInsciptionName('Inscription Inscription')).toBe('# #');
    expect(formatInsciptionName('No Match Here')).toBe('No Match Here');
  });
});
