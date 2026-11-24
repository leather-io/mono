import { proposalPreimageCodec } from './proposal-preimage.kernel';

interface EncodeProposalPreimageArgs {
  domainTag: string;
  multisigAddress: string;
  rawPayload: Uint8Array;
  proposalTimestamp: number;
}

export function encodeProposalPreimage({
  domainTag,
  multisigAddress,
  rawPayload,
  proposalTimestamp,
}: EncodeProposalPreimageArgs): Uint8Array {
  return proposalPreimageCodec.encode([domainTag, multisigAddress, rawPayload, proposalTimestamp]);
}
