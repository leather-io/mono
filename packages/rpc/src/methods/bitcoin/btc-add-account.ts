import { z } from 'zod';

import { defineRpcEndpoint } from '../../rpc/schemas';

export const policyAccountRoleSchema = z.enum(['signer', 'watch-only']);

const btcAddAccountRequestParamsSchema = z.object({
  descriptor: z.string(),
  name: z.string(),
  network: z.string().optional(),
});

const btcAddAccountResponseBodySchema = z.object({
  address: z.string(),
  descriptor: z.string(),
  accountId: z.string(),
  role: policyAccountRoleSchema,
});

export const btcAddAccount = defineRpcEndpoint({
  method: 'btc_addAccount',
  params: btcAddAccountRequestParamsSchema,
  result: btcAddAccountResponseBodySchema,
});
