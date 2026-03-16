import { AddressVersion, privateKeyToPublic, publicKeyToAddress } from '@stacks/transactions';

import { deriveRootKeychainFromMnemonicSync } from '@leather.io/crypto';
import { deriveStxPrivateKey } from '@leather.io/stacks';

export function getStacksAddressByIndex(secretKey: string, addressVersion: AddressVersion) {
  return (index: number) => {
    const accountPrivateKey = deriveStxPrivateKey({
      keychain: deriveRootKeychainFromMnemonicSync(secretKey),
      index,
    });

    const pubKey = privateKeyToPublic(accountPrivateKey);
    return publicKeyToAddress(addressVersion, pubKey);
  };
}
