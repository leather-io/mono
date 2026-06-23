import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { AddressHashMode, AuthType } from '@stacks/transactions';

// Layout of a serialized Stacks transaction's spending-condition prefix:
// version(1) | chain_id(4) | auth_type(1) | hash_mode(1) | signer_hash(N) |
// nonce(8) | fee(8) | ... The nonce (u64 big-endian) immediately follows the
// signer hash, whose size is fixed by the hash mode.
const authTypeOffset = 5;
const hashModeOffset = 6;
const signerHashOffset = 7;
const nonceByteLength = 8;

// Signer-hash size per supported multisig hash mode; the offset of the nonce is
// derived from it. The non-sequential modes (0x05 / 0x07) are the ones V1 vault
// accounts use; the sequential modes share the same sizes.
const signerHashSizeByHashMode: Record<number, number> = {
  [AddressHashMode.P2SH]: 20,
  [AddressHashMode.P2WSH]: 32,
  [AddressHashMode.P2SHNonSequential]: 20,
  [AddressHashMode.P2WSHNonSequential]: 32,
};

// Overwrites the nonce of a serialized unsigned multisig Stacks transaction in
// place, deriving the offset from the parsed spending-condition prefix (never a
// hardcoded constant). Only the 8 nonce bytes change; every other byte is left
// exactly as the proposer committed to. Deserialize/reserialize is deliberately
// avoided — any non-canonical serialization difference would diverge from the
// committed payload. See multisig backend spec §7.2 step 4 / §7.4.
export function substituteStxNonce(rawPayload: string, nonce: number): string {
  const bytes = hexToBytes(rawPayload);

  const authType = bytes[authTypeOffset];
  if (authType !== AuthType.Standard)
    throw new Error(`Unsupported auth type ${authType}; only StandardAuth multisig is supported`);

  const hashMode = bytes[hashModeOffset];
  const signerHashSize = hashMode === undefined ? undefined : signerHashSizeByHashMode[hashMode];
  if (signerHashSize === undefined) throw new Error(`Unsupported multisig hash mode ${hashMode}`);

  const nonceOffset = signerHashOffset + signerHashSize;
  if (nonceOffset + nonceByteLength > bytes.length)
    throw new Error('Payload too short to contain a nonce at the computed offset');

  const nonceBytes = new Uint8Array(nonceByteLength);
  new DataView(nonceBytes.buffer).setBigUint64(0, BigInt(nonce), false);
  bytes.set(nonceBytes, nonceOffset);

  return bytesToHex(bytes);
}
