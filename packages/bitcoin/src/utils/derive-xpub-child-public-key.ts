import { bytesToHex } from '@noble/hashes/utils';

import { deriveKeychainFromXpub } from '@leather.io/crypto';

import { deriveAddressIndexKeychainFromAccount } from './bitcoin.utils';

export function deriveXpubChildPublicKey({
  xpub,
  changeIndex,
  addressIndex,
}: {
  xpub: string;
  changeIndex: number;
  addressIndex: number;
}): string {
  const child = deriveAddressIndexKeychainFromAccount(deriveKeychainFromXpub(xpub))({
    changeIndex,
    addressIndex,
  });
  if (!child.publicKey) throw new Error('Could not derive public key from xpub');
  return bytesToHex(child.publicKey);
}
