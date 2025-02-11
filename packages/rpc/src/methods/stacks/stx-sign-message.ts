import { z } from 'zod';

import { defineRpcEndpoint } from '../../rpc/schemas';

// Request
export const stxSignMessageTypeSchema = z.enum(['utf8', 'structured']);
export type StxSignMessageTypes = z.infer<typeof stxSignMessageTypeSchema>;

export const stxSignMessageRequestBaseSchema = z.object({
  messageType: stxSignMessageTypeSchema.optional().default('utf8'),
  network: z.optional(z.enum(['mainnet', 'testnet', 'devnet', 'mocknet'])),
});
export type StxSignMessageRequestParamsBase = z.infer<typeof stxSignMessageRequestBaseSchema>;

export const stxSignMessageRequestUtf8Schema = stxSignMessageRequestBaseSchema.merge(
  z.object({
    messageType: z.literal('utf8').default('utf8'),
    message: z.string(),
  })
);
export type StxSignMessageRequestParamsUtf8 = z.infer<typeof stxSignMessageRequestUtf8Schema>;

export const stxSignMessageRequestStructuredSchema = stxSignMessageRequestBaseSchema.merge(
  z.object({
    messageType: z.literal('structured'),
    domain: z.string(),
    message: z.string(),
  })
);
export type StxSignMessageRequestParamsStructured = z.infer<
  typeof stxSignMessageRequestStructuredSchema
>;

export const stxSignMessage = defineRpcEndpoint({
  method: 'stx_signMessage',
  params: z.union([stxSignMessageRequestUtf8Schema, stxSignMessageRequestStructuredSchema]),
  result: z.object({
    signature: z.string(),
    publicKey: z.string(),
  }),
});
