import { entitySchema } from '@/store/utils';
import { HDKey } from '@scure/bip32';
import {
  AddressVersion,
  createStacksPrivateKey,
  getPublicKey,
  publicKeyToAddress,
} from '@stacks/transactions';
import z from 'zod';

import { deriveStxPrivateKey } from '@leather.io/stacks';

const stacksKeychainSchema = z.object({
  // Stacks doesn't use the concept of BIP-380 Descriptors the same way Bitcoin
  // does. However, we need to store the same data. Reusing this structure
  // provides a consistent interface between keychain stores. The `descriptor`
  // field here is used to store the derivation path and public key, rather than
  // extended public key (xpub) used in Bitcoin store.
  descriptor: z.string(),
});
export type StacksKeychain = z.infer<typeof stacksKeychainSchema>;
export const stacksKeychainStoreSchema = entitySchema(stacksKeychainSchema);
export type StacksKeychainStore = z.infer<typeof stacksKeychainStoreSchema>;

// seems like secretKey is the mnemonic in this code??
export function getStacksAddressByIndex(rootKeychain: HDKey, addressVersion: AddressVersion) {
  return (index: number) => {
    const accountPrivateKey = createStacksPrivateKey(
      deriveStxPrivateKey({ keychain: rootKeychain, index })
    );
    const pubKey = getPublicKey(accountPrivateKey);
    return publicKeyToAddress(addressVersion, pubKey);
  };
}
