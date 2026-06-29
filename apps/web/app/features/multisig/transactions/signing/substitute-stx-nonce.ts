import { bytesToHex, hexToBytes } from '@stacks/common';
import { AddressHashMode, AuthType } from '@stacks/transactions';

// Leather multisig STX transfers are always StandardAuth, P2SHNonSequential
// multisig, which fixes the serialized spending-condition prefix:
// version(1) | chain_id(4) | auth_type(1) | hash_mode(1) | signer_hash(20) |
// nonce(8) | ... The signer hash is a 20-byte Hash160 for every hash mode, so
// the nonce always starts at byte 27.
const authTypeOffset = 5;
const hashModeOffset = 6;
const nonceOffset = 27;
const nonceByteLength = 8;

// Overwrites the placeholder nonce of a proposed Leather multisig STX transfer
// with the backend-assigned nonce, in place, after asserting the transaction is
// the expected shape.
export function substituteStxNonce({
  rawPayload,
  nonce,
}: {
  rawPayload: string;
  nonce: number;
}): string {
  const bytes = hexToBytes(rawPayload);

  if (bytes[authTypeOffset] !== AuthType.Standard)
    throw new Error('Unexpected auth type; expected a StandardAuth multisig transaction');
  if (bytes[hashModeOffset] !== AddressHashMode.P2SHNonSequential)
    throw new Error('Unexpected hash mode; expected a P2SHNonSequential multisig transaction');
  if (nonceOffset + nonceByteLength > bytes.length)
    throw new Error('Payload too short to contain a nonce at the computed offset');

  const nonceBytes = new Uint8Array(nonceByteLength);
  new DataView(nonceBytes.buffer).setBigUint64(0, BigInt(nonce), false);
  bytes.set(nonceBytes, nonceOffset);

  return bytesToHex(bytes);
}
