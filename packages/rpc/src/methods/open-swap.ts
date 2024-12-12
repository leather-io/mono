import { DefineRpcMethod, RpcParameterByName, RpcRequest, RpcResponse } from '../rpc/schemas';

interface OpenSwapResponseBody {
  message: string;
}

interface OpenSwapRequestParams extends RpcParameterByName {
  base: string;
  quote: string;
}

export type OpenSwapRequest = RpcRequest<'openSwap', OpenSwapRequestParams>;

export type OpenSwapResponse = RpcResponse<OpenSwapResponseBody>;

export type DefineOpenSwapMethod = DefineRpcMethod<OpenSwapRequest, OpenSwapResponse>;
