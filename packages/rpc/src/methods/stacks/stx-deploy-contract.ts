import { z } from 'zod';

import { defineRpcEndpoint } from '../../rpc/schemas';
import {
  baseStacksTransactionConfigSchema,
  stacksTransactionDetailsSchema,
} from './_stacks-helpers';

export const stxDeployContractResponseBodySchema = stacksTransactionDetailsSchema;

export const stxDeployContract = defineRpcEndpoint({
  method: 'stx_deployContract',
  params: z.intersection(
    z.object({
      name: z.string(),
      clarityCode: z.string(),
      clarityVersion: z.coerce.number().optional(),
    }),
    baseStacksTransactionConfigSchema
  ),
  result: stxDeployContractResponseBodySchema,
});
