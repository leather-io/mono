import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils';
import { describe, expect, test } from 'vitest';

import { taggedMessageBytes, taggedMessageText } from './tagged-message.kernel';

const tagHash = sha256(utf8ToBytes('BIP0322-signed-message'));
const doubledTagHash = bytesToHex(Uint8Array.from([...tagHash, ...tagHash]));

describe('tagged message codecs', () => {
  test('start with the BIP-340 tagged-hash prefix for the BIP-322 tag', () => {
    expect(bytesToHex(taggedMessageBytes.encode(undefined, new Uint8Array(0)))).toBe(
      doubledTagHash
    );
  });

  test('put the message after the prefix with nothing in between', () => {
    expect(bytesToHex(taggedMessageBytes.encode(undefined, Uint8Array.of(0xca, 0xfe)))).toBe(
      doubledTagHash + 'cafe'
    );
    expect(bytesToHex(taggedMessageText.encode(undefined, 'hi'))).toBe(doubledTagHash + '6869');
  });
});
