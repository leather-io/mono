import z from 'zod';

import { entitySchema } from '../entity.helpers';

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

const abstractWalletSchema = z.object({
  fingerprint: z.string(),
  createdOn: z.string().nullable(),
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
