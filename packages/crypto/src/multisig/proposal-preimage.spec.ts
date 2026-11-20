import { bytesToHex } from '@noble/hashes/utils';
import fc from 'fast-check';
import { describe, expect, test } from 'vitest';

import { multisigProposalDomainTag } from './proposal-hash';
import { encodeProposalPreimage } from './proposal-preimage';

interface PreimageInput {
  domainTag: string;
  multisigAddress: string;
  rawPayload: Uint8Array;
  proposalTimestamp: number;
}

const u32Bytes = 4;
const u64Bytes = 8;
const twoToThe32 = 2 ** 32;

function referenceU32(value: number): Buffer {
  const buffer = Buffer.alloc(u32Bytes);
  buffer.writeUInt32BE(value);
  return buffer;
}

function referencePreimage(input: PreimageInput): Uint8Array {
  const tag = Buffer.from(input.domainTag, 'utf8');
  const address = Buffer.from(input.multisigAddress, 'utf8');
  const timestamp = Buffer.alloc(u64Bytes);
  timestamp.writeBigUInt64BE(BigInt(input.proposalTimestamp));
  return new Uint8Array(
    Buffer.concat([
      referenceU32(tag.length),
      tag,
      referenceU32(address.length),
      address,
      referenceU32(input.rawPayload.length),
      Buffer.from(input.rawPayload),
      timestamp,
    ])
  );
}

function asciiFromBytes(bytes: Uint8Array): string {
  return String.fromCharCode(...bytes);
}

const prefixLookalikeBytes = [0x00, 0x01, 0x04, 0x08, 0x1c, 0x61];

const textArbitrary = fc.oneof(
  fc.string({ unit: 'binary' }),
  fc.string(),
  fc.string({
    unit: fc.constantFrom(...prefixLookalikeBytes.map(byte => asciiFromBytes(Uint8Array.of(byte)))),
  }),
  fc.constantFrom('', 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', 'адрес-🔐-多重署名')
);

const payloadArbitrary = fc.oneof(
  fc.uint8Array({ maxLength: 512 }),
  fc
    .array(fc.constantFrom(...prefixLookalikeBytes), { maxLength: 24 })
    .map(bytes => Uint8Array.from(bytes)),
  fc.constant(new Uint8Array(0))
);

const timestampArbitrary = fc.oneof(
  fc.maxSafeNat(),
  fc.nat(),
  fc.constantFrom(0, 1, twoToThe32 - 1, twoToThe32, Number.MAX_SAFE_INTEGER)
);

const wellFormedInputArbitrary = fc.record({
  domainTag: fc.oneof(fc.constant(multisigProposalDomainTag), textArbitrary),
  multisigAddress: textArbitrary,
  rawPayload: payloadArbitrary,
  proposalTimestamp: timestampArbitrary,
});

describe(encodeProposalPreimage.name, () => {
  test('lays fields out as length-prefixed tag, address, payload, then a u64 timestamp', () => {
    fc.assert(
      fc.property(wellFormedInputArbitrary, input => {
        expect(bytesToHex(encodeProposalPreimage(input))).toBe(
          bytesToHex(referencePreimage(input))
        );
      })
    );
  });
});
