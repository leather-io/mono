// See JSON RPC specification
// https://www.jsonrpc.org/specification
import { z } from 'zod';

const rpcParameterByPositionSchema = z.string().array();
export type RpcParameterByPosition = z.infer<typeof rpcParameterByPositionSchema>;

const rpcParameterByNameSchema = z.record(z.string(), z.unknown());
export type RpcParameterByName = z.infer<typeof rpcParameterByNameSchema>;

const rpcParameterSchema = z.union([rpcParameterByPositionSchema, rpcParameterByNameSchema]);
export type RpcParameter = z.infer<typeof rpcParameterSchema>;

const rpcBasePropsSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.string(),
});
export type RpcBaseProps = z.infer<typeof rpcBasePropsSchema>;

function rpcRequestSchema<TMethod extends z.ZodTypeAny, TParam extends z.ZodTypeAny>(
  methodSchema: TMethod,
  paramsSchema: TParam
) {
  return rpcBasePropsSchema.extend({ method: methodSchema, params: paramsSchema });
}

type RpcRequestSchema<TMethod, TParam extends RpcParameter = RpcParameter> = ReturnType<
  typeof rpcRequestSchema<z.ZodType<TMethod>, z.ZodType<TParam>>
>;
export type RpcRequest<TMethod, TParam extends RpcParameter = RpcParameter> = z.infer<
  RpcRequestSchema<TMethod, TParam>
>;

function rpcErrorSchema<TErrorData extends z.ZodTypeAny>(errorDataScheme: TErrorData) {
  return z.object({
    code: z.union([z.number(), rpcErrorCodeSchema]),
    message: z.string(),
    data: errorDataScheme.optional(),
  });
}
type RpcErrorSchema<TErrorData extends RpcParameter = RpcParameter> = ReturnType<
  typeof rpcErrorSchema<z.ZodType<TErrorData>>
>;
export type RpcError<TErrorData extends RpcParameter = RpcParameter> = z.infer<
  RpcErrorSchema<TErrorData>
>;

function rpcSuccessResponseSchema<TResult extends z.ZodType<object>>(resultSchema: TResult) {
  return rpcBasePropsSchema.extend({
    result: resultSchema,
  });
}
export type RpcSuccessResponseSchema<TResult extends object> = ReturnType<
  typeof rpcSuccessResponseSchema<z.ZodType<TResult>>
>;
export type RpcSuccessResponse<TResult extends object> = z.infer<RpcSuccessResponseSchema<TResult>>;

function rpcErrorResponseScheme<TError extends z.ZodType<RpcError> = z.ZodType<RpcError>>(
  errorScheme: TError
) {
  return rpcBasePropsSchema.extend({
    error: errorScheme,
  });
}

type RpcErrorResponseSchema<TError extends RpcError = RpcError> = ReturnType<
  typeof rpcErrorResponseScheme<z.ZodType<TError>>
>;
export type RpcErrorResponse<TError extends RpcError = RpcError> = z.infer<
  RpcErrorResponseSchema<TError>
>;

function rpcResponseSchema<
  TResult extends z.ZodType<object>,
  TError extends z.ZodType<RpcError> = z.ZodType<RpcError>,
>(resultSchema: TResult, errorSchema: TError) {
  return z.union([
    rpcSuccessResponseSchema<TResult>(resultSchema),
    rpcErrorResponseScheme<TError>(errorSchema),
  ]);
}
type RpcResponseSchema<TResult extends object, TError extends RpcError = RpcError> = ReturnType<
  typeof rpcResponseSchema<z.ZodType<TResult>, z.ZodType<TError>>
>;
export type RpcResponse<TResult extends object, TError extends RpcError = RpcError> = z.infer<
  RpcResponseSchema<TResult, TError>
>;

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
export type ExtractSuccessResponse<T> = Extract<T, RpcSuccessResponse<any>>;

export type ExtractErrorResponse<T> = Extract<T, RpcErrorResponse<any>>;

function defineRpcMethodSchema<
  TMethod extends string,
  TRequest extends z.ZodType<RpcRequest<string>>,
  TResponse extends z.ZodType<RpcResponse<object>>,
>(method: TMethod, requestSchema: TRequest, responseSchema: TResponse) {
  return z.record(
    z.literal(method),
    z.object({
      request: requestSchema,
      response: responseSchema,
    })
  );
}

type DefineRpcMethodSchema<
  TRequest extends RpcRequest<string>,
  TResponse extends RpcResponse<object>,
> = ReturnType<
  typeof defineRpcMethodSchema<TRequest['method'], z.ZodType<TRequest>, z.ZodType<TResponse>>
>;

// TODO: method should not be optional
export type DefineRpcMethod<
  TRequest extends RpcRequest<string>,
  TResponse extends RpcResponse<object>,
> = z.infer<DefineRpcMethodSchema<TRequest, TResponse>>;

// export type DefineRpcMethod<
//   TRequest extends RpcRequest<string, RpcParameter>,
//   TResponse extends RpcResponse<object>,
// > = Record<
//   TRequest['method'],
//   {
//     request: TRequest;
//     response: TResponse;
//   }
// >;
