import { bytesToHex } from '@noble/hashes/utils';
import { describe, expect, test } from 'vitest';

import { proposalPreimageCodec } from './proposal-preimage.kernel';

describe('proposalPreimageCodec', () => {
  test('writes tag, address and payload with 4-byte lengths, then an 8-byte timestamp', () => {
    expect(
      bytesToHex(
        proposalPreimageCodec.encode([
          'leather-multisig-proposal-v1',
          'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
          Uint8Array.of(0x70, 0x73, 0x62, 0x74, 0xff, 0x01, 0x00),
          1_750_000_000,
        ])
      )
    ).toBe(
      '0000001c6c6561746865722d6d756c74697369672d70726f706f73616c2d7631' +
        '0000002a' +
        '6263317177353038643671656a7874646734793572337a6172766172793063357877376b763866337434' +
        '00000007' +
        '70736274ff0100' +
        '00000000684ee180'
    );
  });
});
