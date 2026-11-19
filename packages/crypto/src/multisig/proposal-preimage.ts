import { concatBytes, utf8ToBytes } from '@noble/hashes/utils';

const maxU32 = 0xffff_ffff;
const firstSurrogate = 0xd800;
const lastSurrogate = 0xdfff;

function u32BigEndian(value: number): Uint8Array {
  if (!Number.isInteger(value) || value < 0 || value > maxU32)
    throw new RangeError('Proposal preimage field length must fit in an unsigned 32-bit integer.');
  const buffer = new Uint8Array(4);
  new DataView(buffer.buffer).setUint32(0, value, false);
  return buffer;
}

function u64BigEndian(value: number): Uint8Array {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new RangeError('Proposal timestamp must be a non-negative safe integer.');
  const buffer = new Uint8Array(8);
  new DataView(buffer.buffer).setBigUint64(0, BigInt(value), false);
  return buffer;
}

function isLoneSurrogate(character: string): boolean {
  const codePoint = character.codePointAt(0);
  return codePoint !== undefined && codePoint >= firstSurrogate && codePoint <= lastSurrogate;
}

function wellFormedUtf8Bytes(value: string): Uint8Array {
  if (Array.from(value).some(isLoneSurrogate))
    throw new TypeError('Proposal preimage text must not contain lone surrogates.');
  return utf8ToBytes(value);
}

function lengthPrefixed(bytes: Uint8Array): Uint8Array {
  return concatBytes(u32BigEndian(bytes.length), bytes);
}

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
  return concatBytes(
    lengthPrefixed(wellFormedUtf8Bytes(domainTag)),
    lengthPrefixed(wellFormedUtf8Bytes(multisigAddress)),
    lengthPrefixed(rawPayload),
    u64BigEndian(proposalTimestamp)
  );
}
