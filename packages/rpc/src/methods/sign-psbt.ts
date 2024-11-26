import { SigHash } from '@scure/btc-signer/transaction';
import { z } from 'zod';

import { testIsNumberOrArrayOfNumbers } from '../rpc/helpers';
import { DefineRpcMethod, RpcRequest, RpcResponse } from '../rpc/schemas';
import { baseNetworkSchema } from '../schemas/network-schemas';
import {
  formatValidationErrors,
  getRpcParamErrors,
  validateRpcParams,
} from '../schemas/validators';

/**
 * DEFAULT       -- all inputs, all outputs
 * ALL           -- all inputs, all outputs
 * NONE          -- all inputs, no outputs
 * SINGLE        -- all inputs, one output of the same index
 * ALL + ANYONE  -- one input, all outputs
 * NONE + ANYONE -- one input, no outputs
 * SINGLE        -- one inputs, one output of the same index
 */
export enum SignatureHash {
  DEFAULT = 0x00,
  ALL = 0x01,
  NONE = 0x02,
  SINGLE = 0x03,
  ALL_ANYONECANPAY = 0x81,
  NONE_ANYONECANPAY = 0x82,
  SINGLE_ANYONECANPAY = 0x83,
}

export type AllowedSighashTypes = SignatureHash | SigHash;

// Pass all sighashTypes through as allowed to btc-signer
export const allSighashTypes = [
  SigHash.DEFAULT,
  SignatureHash.ALL,
  SignatureHash.NONE,
  SignatureHash.SINGLE,
  SigHash.ALL_ANYONECANPAY,
  SignatureHash.ALL_ANYONECANPAY,
  SignatureHash.NONE_ANYONECANPAY,
  SignatureHash.SINGLE_ANYONECANPAY,
];

export const rpcSignPsbtParamsSchema = z.object({
  account: z.number().int().optional(),
  allowedSighash: z.array(z.any()).optional(),
  broadcast: z.boolean().optional(),
  hex: z.string(),
  network: baseNetworkSchema.optional(),
  signAtIndex: z
    .union([z.number(), z.array(z.number())])
    .optional()
    .refine(testIsNumberOrArrayOfNumbers),
});

export function validateRpcSignPsbtParams(obj: unknown) {
  return validateRpcParams(obj, rpcSignPsbtParamsSchema);
}

export function getRpcSignPsbtParamErrors(obj: unknown) {
  return formatValidationErrors(getRpcParamErrors(obj, rpcSignPsbtParamsSchema));
}

export type SignPsbtRequestParams = z.infer<typeof rpcSignPsbtParamsSchema>;

export interface SignPsbtResponseBody {
  hex: string;
  txid?: string;
}

export type SignPsbtRequest = RpcRequest<'signPsbt', SignPsbtRequestParams>;

export type SignPsbtResponse = RpcResponse<SignPsbtResponseBody>;

export type DefineSignPsbtMethod = DefineRpcMethod<SignPsbtRequest, SignPsbtResponse>;
