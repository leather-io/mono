import { z } from 'zod';

import { defineRpcEndpoint } from '../../rpc/schemas';
import { stacksTransactionDetailsSchema } from './_stacks-helpers';

// Request
export const stxUpdateProfileRequestParamsSchema = z.object({
  // schema.org/Person
  person: z.looseObject({}),
});

export const stxUpdateProfileResponseBodySchema = stacksTransactionDetailsSchema;

export const stxUpdateProfile = defineRpcEndpoint({
  method: 'stx_updateProfile',
  params: stxUpdateProfileRequestParamsSchema,
  result: stxUpdateProfileResponseBodySchema,
});
