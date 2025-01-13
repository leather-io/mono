import { z } from 'zod';

import { DefineRpcMethod, RpcRequest, RpcResponse } from '../../rpc/schemas';

export const stxGetAddressesMethodName = 'stx_getAddresses';

type StxGetAddressesRequestMethodName = typeof stxGetAddressesMethodName;

// Request

export type StxGetAddressesRequest = RpcRequest<StxGetAddressesRequestMethodName>;

// Result
export const stxAddressItemSchema = z.object({
  address: z.string(),
  publicKey: z.string(),
  derivationPath: z.string(),
});

export const stxGetAddressesResponseBodySchema = z.array(stxAddressItemSchema);

export type StxGetAddressesResponse = RpcResponse<typeof stxGetAddressesResponseBodySchema>;

export type DefineStxGetAddressesMethod = DefineRpcMethod<
  StxGetAddressesRequest,
  StxGetAddressesResponse
>;
