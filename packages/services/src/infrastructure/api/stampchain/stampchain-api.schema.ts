import { z } from 'zod';

export const stampchainStampSchema = z.object({
  stamp: z.number(),
  stamp_url: z.string(),
  block_index: z.number().optional(),
});

export const stampchainBalanceResponseSchema = z.object({
  data: z.object({
    stamps: z.array(stampchainStampSchema),
  }),
});
