// See JSON RPC specification
// https://www.jsonrpc.org/specification
import { z } from 'zod';

const rpcParameterByPositionSchema = z.string().array();
export type RpcParameterByPosition = z.infer<typeof rpcParameterByPositionSchema>;

const rpcParameterByNameSchema = z.record(z.string(), z.unknown());
export type RpcParameterByName = z.infer<typeof rpcParameterByNameSchema>;

const rpcParameterSchema = z.union([rpcParameterByPositionSchema, rpcParameterByNameSchema]);
export type RpcParameter = z.infer<typeof rpcParameterSchema>;

export const rpcBasePropsSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.string(),
});

export type RpcBaseProps = z.infer<typeof rpcBasePropsSchema>;

//
// RPC Request
export function createRpcRequestSchema<TMethod extends z.ZodTypeAny, TParam extends z.ZodTypeAny>(
  methodSchema: TMethod,
  paramsSchema: TParam
) {
  return rpcBasePropsSchema.extend({ method: methodSchema, params: paramsSchema });
}

type RpcRequestSchema<TMethod, TParam extends RpcParameter = RpcParameter> = ReturnType<
  typeof createRpcRequestSchema<z.ZodType<TMethod>, z.ZodType<TParam>>
>;

export type RpcRequest<TMethod, TParam extends RpcParameter = RpcParameter> = z.infer<
  RpcRequestSchema<TMethod, TParam>
>;

//
// RPC Error Body
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

type RpcErrorResponseSchema<TError extends RpcErrorBody = RpcErrorBody> = ReturnType<
  typeof createRpcErrorResponseSchema<z.ZodType<TError>>
>;

export type RpcErrorResponse<TError extends RpcErrorBody = RpcErrorBody> = z.infer<
  RpcErrorResponseSchema<TError>
>;

//
// RPC Success Response
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
