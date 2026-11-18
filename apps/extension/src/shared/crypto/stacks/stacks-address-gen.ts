import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils';
import { type HDKey } from '@scure/bip32';

export const DATA_DERIVATION_PATH = `m/888'/0'`;

export function deriveStacksSalt(keychain: HDKey) {
  if (keychain.depth !== 2)
    throw new Error('Stacks "salt" must be derived from the data derivation path');
  if (!keychain.publicKey) throw new Error('Stacks "salt" requires a keychain with a public key');
  const publicKeyHex = utf8ToBytes(bytesToHex(keychain.publicKey));
  return bytesToHex(sha256(publicKeyHex));
}
