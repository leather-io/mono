import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import { base64, hex } from '@scure/base';

import { encodeProposalPreimage } from './proposal-preimage';

export const multisigProposalDomainTag = 'leather-multisig-proposal-v1';

export type ProposalChain = 'btc' | 'stx';

// Decodes the transport-encoded `rawPayload` into the bytes the proposal hash
// commits to. The encoding is per-chain and part of the protocol — BTC PSBTs are
// base64, STX raw transactions are hex — and both ends MUST decode identically
// before hashing (the length prefix is over the byte length, not the string).
export function decodeProposalPayload(chain: ProposalChain, rawPayload: string): Uint8Array {
  return chain === 'btc' ? base64.decode(rawPayload) : hex.decode(rawPayload);
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
  const preimage = encodeProposalPreimage({
    domainTag: multisigProposalDomainTag,
    multisigAddress,
    rawPayload,
    proposalTimestamp,
  });
  return bytesToHex(sha256(preimage));
}
