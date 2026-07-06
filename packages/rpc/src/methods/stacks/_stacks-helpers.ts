import { z } from 'zod';

export const stacksRpcNetworkSchema = z.string().min(1).max(64);

export const stacksTransactionDetailsSchema = z.object({
  txid: z.string(),
  transaction: z.string(),
});

export const baseStacksTransactionConfigSchema = z.object({
  address: z.string().optional(),
  network: stacksRpcNetworkSchema.optional(),
  fee: z.coerce.number().optional(),
  nonce: z.coerce.number().optional(),
  // add pc later when imported from stacks.js
  postConditions: z.array(z.string()).optional(),
  postConditionMode: z
    .union([z.literal('allow'), z.literal('deny'), z.literal('originator')])
    .optional(),
  sponsored: z.boolean().optional(),
});

export type BaseStacksTransactionRpcParams = z.infer<typeof baseStacksTransactionConfigSchema>;
