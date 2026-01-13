import { describe, expect, it } from 'vitest';

import { getChainDisplayLabel, getProtocolDisplayLabel } from './display-labels';

describe('getChainDisplayLabel', () => {
  it('returns correct label for bitcoin', () => {
    expect(getChainDisplayLabel('bitcoin')).toBe('Layer 1 (Bitcoin)');
  });

  it('returns correct label for stacks', () => {
    expect(getChainDisplayLabel('stacks')).toBe('Layer 2 (Stacks)');
  });
});

describe('getProtocolDisplayLabel', () => {
  it('returns correct labels for all protocols', () => {
    expect(getProtocolDisplayLabel('nativeBtc')).toBe('Bitcoin');
    expect(getProtocolDisplayLabel('nativeStx')).toBe('Stacks');
    expect(getProtocolDisplayLabel('sip9')).toBe('SIP-009');
    expect(getProtocolDisplayLabel('sip10')).toBe('SIP-010');
    expect(getProtocolDisplayLabel('inscription')).toBe('Ordinals');
    expect(getProtocolDisplayLabel('stamp')).toBe('Stamps');
    expect(getProtocolDisplayLabel('brc20')).toBe('BRC-20');
    expect(getProtocolDisplayLabel('src20')).toBe('SRC-20');
    expect(getProtocolDisplayLabel('rune')).toBe('Runes');
  });
});
