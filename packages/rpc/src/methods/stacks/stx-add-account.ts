import { z } from 'zod';

import { ACCOUNT_MAX_NAME_LENGTH } from '@leather.io/constants';

import { defineRpcEndpoint } from '../../rpc/schemas';
import { policyRoleSchema } from '../bitcoin/btc-add-account';

const compressedSecp256k1PublicKeySchema = z.string().regex(/^0[23][0-9a-fA-F]{64}$/);

const stxAddAccountRequestParamsSchema = z
  .object({
    publicKeys: z.array(compressedSecp256k1PublicKeySchema).min(2),
    threshold: z.number().int().min(1),
    name: z.string().max(ACCOUNT_MAX_NAME_LENGTH),
    network: z.string().optional(),
  })
  .refine(params => params.threshold <= params.publicKeys.length, {
    message: 'threshold must be less than or equal to the number of public keys',
    path: ['threshold'],
  });

const stxAddAccountResultBaseSchema = z.object({
  address: z.string(),
  publicKeys: z.array(z.string()),
  threshold: z.number(),
  role: policyRoleSchema,
});

const stxAccountAddedResultSchema = stxAddAccountResultBaseSchema.extend({
  added: z.literal(true),
  accountId: z.string(),
});

const stxAccountVerifiedResultSchema = stxAddAccountResultBaseSchema.extend({
  added: z.literal(false),
});

const stxAddAccountResponseBodySchema = z.discriminatedUnion('added', [
  stxAccountAddedResultSchema,
  stxAccountVerifiedResultSchema,
]);

export const stxAddAccount = defineRpcEndpoint({
  method: 'stx_addAccount',
  params: stxAddAccountRequestParamsSchema,
  result: stxAddAccountResponseBodySchema,
});
