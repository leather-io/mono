import { z } from 'zod';

export const emilySbtcLimitsResponseSchema = z.object({
  pegCap: z.number().nullable(),
  perDepositCap: z.number().nullable(),
  perDepositMinimum: z.number().nullable(),
  perWithdrawalCap: z.number().nullable(),
  accountCaps: z.record(z.string(), z.any()),
});

export type EmilySbtcLimitsResponse = z.infer<typeof emilySbtcLimitsResponseSchema>;
