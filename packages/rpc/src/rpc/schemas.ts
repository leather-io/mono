// See JSON RPC specification
// https://www.jsonrpc.org/specification
import { z } from 'zod';

const rpcParameterByPositionSchema = z.string().array();
export type RpcParameterByPosition = z.infer<typeof rpcParameterByPositionSchema>;

const rpcParameterByNameSchema = z.record(z.string(), z.unknown());
export type RpcParameterByName = z.infer<typeof rpcParameterByNameSchema>;

export const rpcParameterSchema = z.union([
  rpcParameterByPositionSchema,
  rpcParameterByNameSchema,
  z.undefined(),
]);
export type RpcParameter = z.infer<typeof rpcParameterSchema>;

export const rpcBasePropsSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.string(),
});

type BaseRpcRequestSchema = typeof rpcBasePropsSchema;
export type RpcBaseProps = z.infer<typeof rpcBasePropsSchema>;

//
// RPC Request
// {
//   "jsonrpc": "2.0",
//   "id": "123",
//   "method": "signPsbt",
//   "params": { "psbt": "dead…beef" },
// }
export function createRpcRequestSchema<TMethod extends string>(
  method: TMethod
): BaseRpcRequestSchema & z.ZodObject<{ method: z.ZodLiteral<TMethod> }>;
export function createRpcRequestSchema<TMethod extends string, TParam extends z.ZodTypeAny>(
  method: TMethod,
  paramsSchema: TParam
): BaseRpcRequestSchema & z.ZodObject<{ method: z.ZodLiteral<TMethod>; params: TParam }>;
export function createRpcRequestSchema<TMethod extends string, TParam extends z.ZodTypeAny>(
  method: TMethod,
  paramsSchema?: TParam
) {
  // Unable to type this without the any, however the return type is corrects
  if (!paramsSchema) return rpcBasePropsSchema.extend({ method: z.literal(method) }) as any;

  return rpcBasePropsSchema.extend({
    method: z.literal(method),
    params: paramsSchema,
  });
}

type RpcRequestSchema<TMethod extends string, TParam extends RpcParameter> = ReturnType<
  typeof createRpcRequestSchema<TMethod, z.ZodType<TParam>>
>;

export type RpcRequest<TMethod extends string, TParam extends RpcParameter = undefined> = z.infer<
  RpcRequestSchema<TMethod, TParam>
>;

//
// RPC Error Body

export enum RpcErrorCode {
  // Spec defined server errors
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
  SERVER_ERROR = -32000,
  // Client defined errors
  USER_REJECTION = 4001,
  METHOD_NOT_SUPPORTED = 4002,
}
const rpcErrorCodeSchema = z.nativeEnum(RpcErrorCode);

export function createRpcErrorBodySchema<TErrorData extends z.ZodTypeAny>(
  errorDataSchema: TErrorData
) {
  return z.object({
    code: z.union([z.number(), rpcErrorCodeSchema]),
    message: z.string(),
    data: errorDataSchema.optional(),
  });
}

type RpcErrorBodySchema<TErrorData extends RpcParameter = RpcParameter> = ReturnType<
  typeof createRpcErrorBodySchema<z.ZodType<TErrorData>>
>;

export type RpcErrorBody<TErrorData extends RpcParameter = RpcParameter> = z.infer<
  RpcErrorBodySchema<TErrorData>
>;

//
// RPC Error Response
export function createRpcErrorResponseSchema<
  TError extends z.ZodType<RpcErrorBody> = z.ZodType<RpcErrorBody>,
>(errorSchema: TError) {
  return rpcBasePropsSchema.extend({ error: errorSchema });
}

export const defaultErrorSchema = createRpcErrorBodySchema(z.any());

type RpcErrorResponseSchema<TError extends RpcErrorBody = RpcErrorBody> = ReturnType<
  typeof createRpcErrorResponseSchema<z.ZodType<TError>>
>;

export type RpcErrorResponse<TError extends RpcErrorBody = RpcErrorBody> = z.infer<
  RpcErrorResponseSchema<TError>
>;

//
// RPC Success Response
// {
//   "jsonrpc": "2.0",
//   "id": "123",
//   "result": { "signature": "dead…beef" }
// }
export function createRpcSuccessResponseSchema<TResult extends z.ZodType<object>>(
  resultSchema: TResult
) {
  return rpcBasePropsSchema.extend({ result: resultSchema });
}

export type RpcSuccessResponseSchema<TResult extends object> = ReturnType<
  typeof createRpcSuccessResponseSchema<z.ZodType<TResult>>
>;

export type RpcSuccessResponse<TResult extends object> = z.infer<RpcSuccessResponseSchema<TResult>>;

export function createRpcResponseSchema<
  TResult extends z.ZodType<object>,
  TError extends z.ZodType<RpcErrorBody>,
>(resultSchema: TResult, errorSchema: TError) {
  return z.union([
    createRpcSuccessResponseSchema<TResult>(resultSchema),
    createRpcErrorResponseSchema<TError>(errorSchema),
  ]);
}

type RpcResponseSchema<
  TResult extends object,
  TError extends RpcErrorBody = RpcErrorBody,
> = ReturnType<typeof createRpcResponseSchema<z.ZodType<TResult>, z.ZodType<TError>>>;

export type RpcResponse<
  TResult extends object,
  TError extends RpcErrorBody = RpcErrorBody,
> = z.infer<RpcResponseSchema<TResult, TError>>;

export type ExtractSuccessResponse<T> = Extract<T, { result: any }>;

export type ExtractErrorResponse<T> = Extract<T, { error: any }>;

export type DefineRpcMethod<
  TRequest extends RpcRequest<string, RpcParameter>,
  TResponse extends RpcResponse<object>,
> = Record<
  TRequest['method'],
  {
    request: TRequest;
    response: TResponse;
  }
>;
