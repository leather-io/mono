import { z } from 'zod';

export const walletIdSchema = z.object({
  fingerprint: z.string(),
});

export const accountIdSchema = walletIdSchema.merge(z.object({ accountIndex: z.number() }));

export const bitcoinAddressInfoSchema = z.object({
  taprootDescriptor: z.string(),
  nativeSegwitDescriptor: z.string(),
});

export const stacksAddressInfoSchema = z.object({
  stxAddress: z.string(),
});

export const accountAddressesSchema = z.object({
  id: accountIdSchema,
  bitcoin: bitcoinAddressInfoSchema.optional(),
  stacks: stacksAddressInfoSchema.optional(),
});

export type WalletId = z.infer<typeof walletIdSchema>;
export type AccountId = z.infer<typeof accountIdSchema>;
export type BitcoinAddressInfo = z.infer<typeof bitcoinAddressInfoSchema>;
export type StacksAddressInfo = z.infer<typeof stacksAddressInfoSchema>;
export type AccountAddresses = z.infer<typeof accountAddressesSchema>;
