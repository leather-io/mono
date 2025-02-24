import { z } from 'zod';

export const stacksTransactionDetailsSchema = z.object({
  txid: z.string(),
  transaction: z.string(),
});

export const baseStacksTransactionConfigSchema = z.object({
  address: z.string().optional(),
  network: z
    .union([
      z.literal('mainnet'),
      z.literal('testnet'),
      z.literal('regtest'),
      z.literal('devnet'),
      z.literal('mocknet'),
      z.string(),
    ])
    .optional(),
  fee: z.coerce.number().optional(),
  nonce: z.coerce.number().optional(),
  // add pc later when imported from stacks.js
  postConditions: z.array(z.string()).optional(),
  postConditionMode: z.union([z.literal('allow'), z.literal('deny')]).optional(),
  sponsored: z.boolean().optional(),
});
