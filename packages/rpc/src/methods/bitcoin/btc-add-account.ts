import { z } from 'zod';

import { ACCOUNT_MAX_NAME_LENGTH } from '@leather.io/constants';

import { defineRpcEndpoint } from '../../rpc/schemas';

export const policyRoleSchema = z.enum(['signer']);

const btcAddAccountRequestParamsSchema = z.object({
  descriptor: z.string(),
  name: z.string().max(ACCOUNT_MAX_NAME_LENGTH),
  network: z.string().optional(),
});

const btcAddAccountResultBaseSchema = z.object({
  address: z.string(),
  descriptor: z.string(),
  role: policyRoleSchema,
});

const btcAccountAddedResultSchema = btcAddAccountResultBaseSchema.extend({
  added: z.literal(true),
  accountId: z.string(),
});

const btcAccountVerifiedResultSchema = btcAddAccountResultBaseSchema.extend({
  added: z.literal(false),
});

const btcAddAccountResponseBodySchema = z.discriminatedUnion('added', [
  btcAccountAddedResultSchema,
  btcAccountVerifiedResultSchema,
]);

export const btcAddAccount = defineRpcEndpoint({
  method: 'btc_addAccount',
  params: btcAddAccountRequestParamsSchema,
  result: btcAddAccountResponseBodySchema,
});
