// See JSON RPC specification
// https://www.jsonrpc.org/specification

export type RpcParameterByPosition = string[];
export type RpcParameterByName = Record<string, string>;

export type RpcParameter = RpcParameterByPosition | RpcParameterByName;
export interface RpcBaseProps {
  jsonrpc: '2.0';
  id: string;
}

export interface RpcRequest<TMethod, TParam = RpcParameter> extends RpcBaseProps {
  method: TMethod;
  params?: TParam;
}

export interface RpcError<TErrorData = RpcParameter> {
  code: number | RpcErrorCode;
  message: string;
  data?: TErrorData;
}

export interface RpcSuccessResponse<TResult extends object> extends RpcBaseProps {
  result: TResult;
}

export interface RpcErrorResponse<TError extends RpcError = RpcError> extends RpcBaseProps {
  error: TError;
}

export type RpcResponse<TResult extends object, TError extends RpcError = RpcError> =
  | RpcSuccessResponse<TResult>
  | RpcErrorResponse<TError>;

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

export type ExtractSuccessResponse<T> = Extract<T, RpcSuccessResponse<any>>;

export type ExtractErrorResponse<T> = Extract<T, RpcErrorResponse<any>>;

export type DefineRpcMethod<
  TRequest extends RpcRequest<string, unknown>,
  TResponse extends RpcResponse<object>,
> = Record<
  TRequest['method'],
  {
    request: TRequest;
    response: TResponse;
  }
>;
