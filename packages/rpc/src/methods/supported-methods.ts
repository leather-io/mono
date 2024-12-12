import { z } from 'zod';

import { DefineRpcMethod, RpcRequest, RpcSuccessResponse } from '../rpc/schemas';

export const supportedMethodsMethodName = 'supportedMethods';

export type SupportedMethodsRequest = RpcRequest<typeof supportedMethodsMethodName>;

export const supportedMethodSchema = z.object({
  name: z.string(),
  docsUrl: z.union([z.string(), z.array(z.string())]),
});

export const supportedMethodsResponseSchema = z.object({
  documentation: z.string(),
  methods: z.array(supportedMethodSchema),
});

type SupportedMethodsResponse = RpcSuccessResponse<{
  documentation: string;
  methods: z.infer<typeof supportedMethodSchema>[];
}>;

export type DefineSupportedMethods = DefineRpcMethod<
  SupportedMethodsRequest,
  SupportedMethodsResponse
>;
