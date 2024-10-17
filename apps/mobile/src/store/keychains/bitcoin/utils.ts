import { entitySchema } from '@/store/utils';
import z from 'zod';

const bitcoinKeychainSchema = z.object({
  descriptor: z.string(),
});
export type BitcoinKeychain = z.infer<typeof bitcoinKeychainSchema>;
export const bitcoinKeychainStoreSchema = entitySchema(bitcoinKeychainSchema);
export type BitcoinKeychainStore = z.infer<typeof bitcoinKeychainStoreSchema>;
