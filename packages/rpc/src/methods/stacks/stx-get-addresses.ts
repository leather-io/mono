import { z } from 'zod';

import {
  DefineRpcMethod,
  createRpcRequestSchema,
  createRpcResponseSchema,
  defaultErrorSchema,
} from '../../rpc/schemas';

export const stxGetAddressesMethodName = 'stx_getAddresses';

export type StxGetAddressesRequestMethodName = typeof stxGetAddressesMethodName;

// Request
export const stxGetAddressesRequestSchema = createRpcRequestSchema(stxGetAddressesMethodName);

export type StxGetAddressesRequest = z.infer<typeof stxGetAddressesRequestSchema>;

// Result
export const stxAddressItemSchema = z.object({
  address: z.string(),
  publicKey: z.string(),
  derivationPath: z.string(),
});

export const stxGetAddressesResponseBodySchema = z.array(stxAddressItemSchema);

export const stxGetAddressesResponseSchema = createRpcResponseSchema(
  stxGetAddressesResponseBodySchema,
  defaultErrorSchema
);

export type StxGetAddressesResponse = z.infer<typeof stxGetAddressesResponseSchema>;

export type DefineStxGetAddressesMethod = DefineRpcMethod<
  StxGetAddressesRequest,
  StxGetAddressesResponse
>;
