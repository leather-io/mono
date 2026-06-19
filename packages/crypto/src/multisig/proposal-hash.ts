import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, concatBytes, utf8ToBytes } from '@noble/hashes/utils';
import { base64, hex } from '@scure/base';

export const multisigProposalDomainTag = 'leather-multisig-proposal-v1';

export type ProposalChain = 'btc' | 'stx';

// Decodes the transport-encoded `rawPayload` into the bytes the proposal hash
// commits to. The encoding is per-chain and part of the protocol — BTC PSBTs are
// base64, STX raw transactions are hex — and both ends MUST decode identically
// before hashing (the length prefix is over the byte length, not the string).
export function decodeProposalPayload(chain: ProposalChain, rawPayload: string): Uint8Array {
  return chain === 'btc' ? base64.decode(rawPayload) : hex.decode(rawPayload);
}

function u32BigEndian(value: number): Uint8Array {
  const buffer = new Uint8Array(4);
  new DataView(buffer.buffer).setUint32(0, value, false);
  return buffer;
}

function u64BigEndian(value: number): Uint8Array {
  const buffer = new Uint8Array(8);
  new DataView(buffer.buffer).setBigUint64(0, BigInt(value), false);
  return buffer;
}

function lengthPrefixed(bytes: Uint8Array): Uint8Array {
  return concatBytes(u32BigEndian(bytes.length), bytes);
}

export interface ComputeProposalHashArgs {
  multisigAddress: string;
  rawPayload: Uint8Array;
  proposalTimestamp: number;
}

export function computeProposalHash({
  multisigAddress,
  rawPayload,
  proposalTimestamp,
}: ComputeProposalHashArgs): string {
  const preimage = concatBytes(
    lengthPrefixed(utf8ToBytes(multisigProposalDomainTag)),
    lengthPrefixed(utf8ToBytes(multisigAddress)),
    lengthPrefixed(rawPayload),
    u64BigEndian(proposalTimestamp)
  );
  return bytesToHex(sha256(preimage));
}
