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

const stxAddAccountResponseBodySchema = z.object({
  address: z.string(),
  publicKeys: z.array(z.string()),
  threshold: z.number(),
  role: policyRoleSchema,
  accountId: z.string().optional(),
  added: z.boolean(),
});

export const stxAddAccount = defineRpcEndpoint({
  method: 'stx_addAccount',
  params: stxAddAccountRequestParamsSchema,
  result: stxAddAccountResponseBodySchema,
});
