import { z } from 'zod';

import { ACCOUNT_MAX_NAME_LENGTH } from '@leather.io/constants';

import { defineRpcEndpoint } from '../../rpc/schemas';

export const policyRoleSchema = z.enum(['signer']);

const btcAddAccountRequestParamsSchema = z.object({
  descriptor: z.string(),
  name: z.string().max(ACCOUNT_MAX_NAME_LENGTH),
  network: z.string().optional(),
});

const btcAddAccountResponseBodySchema = z.object({
  address: z.string(),
  descriptor: z.string(),
  accountId: z.string().optional(),
  role: policyRoleSchema,
  added: z.boolean(),
});

export const btcAddAccount = defineRpcEndpoint({
  method: 'btc_addAccount',
  params: btcAddAccountRequestParamsSchema,
  result: btcAddAccountResponseBodySchema,
});
