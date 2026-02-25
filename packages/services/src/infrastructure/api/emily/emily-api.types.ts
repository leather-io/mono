import { z } from 'zod';

export const emilySbtcLimitsResponseSchema = z.object({
  pegCap: z.number().nullable(),
  perDepositCap: z.number().nullable(),
  perDepositMinimum: z.number().nullable(),
  perWithdrawalCap: z.number().nullable(),
  accountCaps: z.record(z.string(), z.any()),
});

export type EmilySbtcLimitsResponse = z.infer<typeof emilySbtcLimitsResponseSchema>;

export const emilySbtcDepositStatusSchema = z.union([
  z.literal('pending'),
  z.literal('accepted'),
  z.literal('confirmed'),
  z.literal('failed'),
  z.literal('rbf'),
]);

export type EmilySbtcDepositStatus = z.infer<typeof emilySbtcDepositStatusSchema>;

export const emilySbtcDepositSchema = z.object({
  amount: z.number(),
  bitcoinTxOutputIndex: z.number(),
  bitcoinTxid: z.string(),
  depositScript: z.string(),
  lastUpdateBlockHash: z.string(),
  lastUpdateHeight: z.number(),
  recipient: z.string(),
  reclaimScript: z.string(),
  status: emilySbtcDepositStatusSchema,
});

export type EmilySbtcDeposit = z.infer<typeof emilySbtcDepositSchema>;

export const emilySbtcDepositsResponseSchema = z.object({
  deposits: z.array(emilySbtcDepositSchema),
  nextToken: z.string().optional().nullable(),
});

export type EmilySbtcDepositsResponse = z.infer<typeof emilySbtcDepositsResponseSchema>;
