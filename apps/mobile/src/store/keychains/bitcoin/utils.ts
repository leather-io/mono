import z from 'zod';

import { entitySchema } from '@leather.io/state';

const bitcoinKeychainSchema = z.object({
  descriptor: z.string(),
});
export type BitcoinKeychain = z.infer<typeof bitcoinKeychainSchema>;
export const bitcoinKeychainStoreSchema = entitySchema(bitcoinKeychainSchema);
