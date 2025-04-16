import { entitySchema } from '@/store/utils';
import z from 'zod';

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
