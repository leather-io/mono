import { z } from 'zod';

import { defineRpcEndpoint } from '../../rpc/schemas';

export const policyRoleSchema = z.enum(['signer']);

const btcAddAccountRequestParamsSchema = z.object({
  descriptor: z.string(),
  name: z.string(),
  network: z.string().optional(),
});

const btcAddAccountResponseBodySchema = z.object({
  address: z.string(),
  descriptor: z.string(),
  accountId: z.string(),
  role: policyRoleSchema,
});

export const btcAddAccount = defineRpcEndpoint({
  method: 'btc_addAccount',
  params: btcAddAccountRequestParamsSchema,
  result: btcAddAccountResponseBodySchema,
});
