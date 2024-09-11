import { z } from 'zod';

export const walletIdSchema = z.object({
  fingerprint: z.string(),
});

export type WalletId = z.infer<typeof walletIdSchema>;

export const accountIdSchema = walletIdSchema.merge(z.object({ accountIndex: z.number() }));

export type AccountId = z.infer<typeof accountIdSchema>;
