import { DefineRpcMethod, RpcRequest, RpcResponse } from '../rpc/schemas';

interface OpenResponseBody {
  message: string;
}

export type OpenRequest = RpcRequest<'open'>;

export type OpenResponse = RpcResponse<OpenResponseBody>;

export type DefineOpenMethod = DefineRpcMethod<OpenRequest, OpenResponse>;
