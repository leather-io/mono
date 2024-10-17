import z from 'zod';

import { Optional, entitySchema } from '../utils';

const abstractWalletSchema = z.object({
  fingerprint: z.string(),
  createdOn: z.string(),
  name: z.string(),
});
export type AbstractWalletStore = z.infer<typeof abstractWalletSchema>;

const softwareWalletSchema = abstractWalletSchema.extend({
  type: z.literal('software'),
});
export type SoftwareWalletStore = z.infer<typeof softwareWalletSchema>;

const ledgerWalletSchema = abstractWalletSchema.extend({
  type: z.literal('ledger'),
});
export type LedgerWalletStore = z.infer<typeof ledgerWalletSchema>;

const walletStoreSchema = z.union([softwareWalletSchema, ledgerWalletSchema]);
export type WalletStore = z.infer<typeof walletStoreSchema>;

export type PartialWalletStore = Optional<WalletStore, 'name'>;

export const walletEntitySchema = entitySchema(walletStoreSchema);
