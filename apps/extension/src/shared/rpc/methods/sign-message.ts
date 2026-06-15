import { z } from 'zod';

import {
  accountSchema,
  formatValidationErrors,
  getRpcParamErrors,
  validateRpcParams,
} from './validation.utils';

const rpcSignMessageParamsSchema = z.object({
  type: z.enum(['bip322']).optional(),
  account: accountSchema.optional(),
  message: z.string(),
  network: z.string().optional(),
  paymentType: z.enum(['p2tr', 'p2wpkh']).optional(),
});

export function validateRpcSignMessageParams(obj: unknown) {
  return validateRpcParams(obj, rpcSignMessageParamsSchema);
}

export function getRpcSignMessageParamErrors(obj: unknown) {
  return formatValidationErrors(getRpcParamErrors(obj, rpcSignMessageParamsSchema));
}
