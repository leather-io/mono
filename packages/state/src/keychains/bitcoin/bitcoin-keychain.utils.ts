import z from 'zod';

import { entitySchema } from '../../entity.helpers';

const bitcoinKeychainSchema = z.object({
  descriptor: z.string(),
  chain: z.literal('bitcoin'),
});
export type BitcoinKeychain = z.infer<typeof bitcoinKeychainSchema>;
export const bitcoinKeychainStoreSchema = entitySchema(bitcoinKeychainSchema);
