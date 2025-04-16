import z from 'zod';

import { Optional, entitySchema } from '../utils';

const abstractWalletSchema = z.object({
  fingerprint: z.string(),
  createdOn: z.string(),
  name: z.string(),
});

const softwareWalletSchema = abstractWalletSchema.extend({
  type: z.literal('software'),
});

const ledgerWalletSchema = abstractWalletSchema.extend({
  type: z.literal('ledger'),
});

const walletStoreSchema = z.union([softwareWalletSchema, ledgerWalletSchema]);
export type WalletStore = z.infer<typeof walletStoreSchema>;

export type PartialWalletStore = Optional<WalletStore, 'name'>;

export const walletEntitySchema = entitySchema(walletStoreSchema);
