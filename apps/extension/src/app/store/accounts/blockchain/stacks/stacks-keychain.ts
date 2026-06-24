import { HDKey } from '@scure/bip32';
import { AddressVersion, privateKeyToPublic, publicKeyToAddress } from '@stacks/transactions';

import { deriveStxPrivateKey } from '@leather.io/stacks';

export function getStacksAddressByIndex(rootKeychain: HDKey, addressVersion: AddressVersion) {
  return (index: number) => {
    const accountPrivateKey = deriveStxPrivateKey({
      keychain: rootKeychain,
      index,
    });

    const pubKey = privateKeyToPublic(accountPrivateKey);
    return publicKeyToAddress(addressVersion, pubKey);
  };
}
