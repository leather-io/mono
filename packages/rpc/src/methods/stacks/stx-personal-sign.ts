import { z } from 'zod';

import { defineRpcEndpoint } from '../../rpc/schemas';

export const stxPersonalSignRequestSchema = z.object({
  domain: z.string(),
  address: z.string(),
  statement: z.string().optional(),
  uri: z.string(),
  version: z.string().default('1'),
  chainId: z.number(),
  nonce: z.string(),
  issuedAt: z.string(),
  expirationTime: z.string().optional(),
  notBefore: z.string().optional(),
  requestId: z.string(),
  resources: z.array(z.string()).optional(),
});

export type StxPersonalSignRequestParams = z.infer<typeof stxPersonalSignRequestSchema>;

export const stxPersonalSign = defineRpcEndpoint({
  method: 'stx_personalSign',
  params: stxPersonalSignRequestSchema,
  result: z.object({
    signature: z.string(),
    publicKey: z.string(),
    message: z.string(),
  }),
});
