import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { describe, expect, test } from 'vitest';

import { witnessStackCodec } from './witness-stack.kernel';

describe('witnessStackCodec', () => {
  test('writes the item count and then each item behind its length', () => {
    const stack = [Uint8Array.of(0x30, 0x44), new Uint8Array(0), Uint8Array.of(0x02)];
    expect(bytesToHex(witnessStackCodec.encode(stack))).toBe('03' + '023044' + '00' + '0102');
    expect(witnessStackCodec.decode(hexToBytes('0302304400' + '0102'))).toEqual(stack);
  });

  test('writes counts and lengths of 253 or more in the three-byte form', () => {
    const item = new Uint8Array(253);
    expect(bytesToHex(witnessStackCodec.encode([item])).slice(0, 8)).toBe('01' + 'fdfd00');
  });
});
