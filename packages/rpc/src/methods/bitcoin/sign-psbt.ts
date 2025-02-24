import { z } from 'zod';

import { testIsNumberOrArrayOfNumbers } from '../../rpc/helpers';
import { defineRpcEndpoint } from '../../rpc/schemas';

/**
 * DEFAULT       -- all inputs, all outputs
 * ALL           -- all inputs, all outputs
 * NONE          -- all inputs, no outputs
 * SINGLE        -- all inputs, one output of the same index
 * ALL + ANYONE  -- one input, all outputs
 * NONE + ANYONE -- one input, no outputs
 * SINGLE        -- one inputs, one output of the same index
 */
export const signatureHash = {
  DEFAULT: 0x00,
  ALL: 0x01,
  NONE: 0x02,
  SINGLE: 0x03,
  ALL_ANYONECANPAY: 0x81,
  NONE_ANYONECANPAY: 0x82,
  SINGLE_ANYONECANPAY: 0x83,
} as const;

const signPsbtRequestParamsSchema = z.object({
  account: z.number().optional(),
  allowedSighash: z.array(z.any()).optional(),
  broadcast: z.boolean().optional(),
  hex: z.string(),
  network: z.string().optional(),
  signAtIndex: z
    .union([z.number(), z.array(z.number())])
    .optional()
    .refine(testIsNumberOrArrayOfNumbers),
});

const signPsbtResponseBodySchema = z.object({
  hex: z.string(),
  txid: z.string().optional(),
});

export const signPsbt = defineRpcEndpoint({
  method: 'signPsbt',
  params: signPsbtRequestParamsSchema,
  result: signPsbtResponseBodySchema,
});
