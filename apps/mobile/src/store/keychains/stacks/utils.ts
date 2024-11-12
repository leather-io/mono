import { entitySchema } from '@/store/utils';
import {
  AddressVersion,
  createStacksPrivateKey,
  getPublicKey,
  publicKeyToAddress,
} from '@stacks/transactions';
import { deriveStxPrivateKey } from '@stacks/wallet-sdk';
import z from 'zod';

// FIXME fix this deprecated import
import { mnemonicToRootNode } from '@leather.io/bitcoin';

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
export function getStacksAddressByIndex(secretKey: string, addressVersion: AddressVersion) {
  return (index: number) => {
    const accountPrivateKey = createStacksPrivateKey(
      deriveStxPrivateKey({ rootNode: mnemonicToRootNode(secretKey) as any, index })
    );
    const pubKey = getPublicKey(accountPrivateKey);
    return publicKeyToAddress(addressVersion, pubKey);
  };
}
