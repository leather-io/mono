import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import {
  computeProposalHash,
  decodeProposalPayload,
  multisigProposalDomainTag,
} from './proposal-hash';

// Independent reconstruction of the proposal-hash preimage using Node's Buffer +
// node:crypto — deliberately NOT @noble/hashes — so this cross-check catches
// implementation bugs (wrong endianness, missing length prefix, string-vs-bytes)
// independently of the primitive under test.
function referenceProposalHash(
  multisigAddress: string,
  rawPayload: Uint8Array,
  proposalTimestamp: number
): string {
  const tag = Buffer.from(multisigProposalDomainTag, 'utf8');
  const address = Buffer.from(multisigAddress, 'utf8');
  const payload = Buffer.from(rawPayload);

  function u32(value: number) {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32BE(value);
    return buffer;
  }
  const u64 = Buffer.alloc(8);
  u64.writeBigUInt64BE(BigInt(proposalTimestamp));

  const preimage = Buffer.concat([
    u32(tag.length),
    tag,
    u32(address.length),
    address,
    u32(payload.length),
    payload,
    u64,
  ]);
  return createHash('sha256').update(preimage).digest('hex');
}

const sampleAddress = 'bc1qexampleexampleexampleexampleexampleexampleexampleex';
const samplePayload = new Uint8Array([0x70, 0x73, 0x62, 0x74, 0xff, 0x00, 0x01]);
const sampleTimestamp = 1_718_600_000;

describe(computeProposalHash, () => {
  it('returns a 64-char lowercase hex string', () => {
    const hash = computeProposalHash({
      multisigAddress: sampleAddress,
      rawPayload: samplePayload,
      proposalTimestamp: sampleTimestamp,
    });
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is deterministic for identical inputs', () => {
    const args = {
      multisigAddress: sampleAddress,
      rawPayload: samplePayload,
      proposalTimestamp: sampleTimestamp,
    };
    expect(computeProposalHash(args)).toBe(computeProposalHash(args));
  });

  it('matches an independent Buffer + node:crypto reconstruction', () => {
    expect(
      computeProposalHash({
        multisigAddress: sampleAddress,
        rawPayload: samplePayload,
        proposalTimestamp: sampleTimestamp,
      })
    ).toBe(referenceProposalHash(sampleAddress, samplePayload, sampleTimestamp));
  });

  it('changes when the multisig address changes', () => {
    const base = computeProposalHash({
      multisigAddress: sampleAddress,
      rawPayload: samplePayload,
      proposalTimestamp: sampleTimestamp,
    });
    const other = computeProposalHash({
      multisigAddress: `${sampleAddress}x`,
      rawPayload: samplePayload,
      proposalTimestamp: sampleTimestamp,
    });
    expect(other).not.toBe(base);
  });

  it('changes when the raw payload changes', () => {
    const base = computeProposalHash({
      multisigAddress: sampleAddress,
      rawPayload: samplePayload,
      proposalTimestamp: sampleTimestamp,
    });
    const other = computeProposalHash({
      multisigAddress: sampleAddress,
      rawPayload: new Uint8Array([...samplePayload, 0x02]),
      proposalTimestamp: sampleTimestamp,
    });
    expect(other).not.toBe(base);
  });

  it('changes when the timestamp changes', () => {
    const base = computeProposalHash({
      multisigAddress: sampleAddress,
      rawPayload: samplePayload,
      proposalTimestamp: sampleTimestamp,
    });
    const other = computeProposalHash({
      multisigAddress: sampleAddress,
      rawPayload: samplePayload,
      proposalTimestamp: sampleTimestamp + 1,
    });
    expect(other).not.toBe(base);
  });

  it('disambiguates field boundaries (length-prefix is load-bearing)', () => {
    // Moving a byte across the address/payload boundary must change the hash —
    // proves the length prefixes prevent canonicalization collisions.
    const left = computeProposalHash({
      multisigAddress: 'ab',
      rawPayload: new Uint8Array([0x63, 0x64]),
      proposalTimestamp: sampleTimestamp,
    });
    const right = computeProposalHash({
      multisigAddress: 'abc',
      rawPayload: new Uint8Array([0x64]),
      proposalTimestamp: sampleTimestamp,
    });
    expect(left).not.toBe(right);
  });

  it('matches the fixed proposal-hash vector (BTC)', () => {
    expect(
      computeProposalHash({
        multisigAddress: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
        rawPayload: hexToBytes('70736274ff0100'),
        proposalTimestamp: 1_750_000_000,
      })
    ).toBe('9ca717cea2e28cce2dd2db175ed9bc5a959748cade6c4e1bf11eacc53dd54c6c');
  });
});

describe(decodeProposalPayload, () => {
  it('base64-decodes a BTC PSBT payload', () => {
    // 'cHNidP8BAA==' is the base64 of the same 7 payload bytes.
    expect(bytesToHex(decodeProposalPayload('btc', 'cHNidP8BAA=='))).toBe('70736274ff0100');
  });

  it('hex-decodes an STX raw-transaction payload', () => {
    expect(bytesToHex(decodeProposalPayload('stx', '70736274ff0100'))).toBe('70736274ff0100');
  });

  it('feeds the same bytes the fixed hash vector commits to (BTC)', () => {
    expect(
      computeProposalHash({
        multisigAddress: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
        rawPayload: decodeProposalPayload('btc', 'cHNidP8BAA=='),
        proposalTimestamp: 1_750_000_000,
      })
    ).toBe('9ca717cea2e28cce2dd2db175ed9bc5a959748cade6c4e1bf11eacc53dd54c6c');
  });
});
