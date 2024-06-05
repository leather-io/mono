import { DefineRpcMethod, RpcRequest, RpcResponse } from '../rpc';

export type StxSignMessageTypes = 'utf8' | 'structured';

export interface StxSignMessageRequestParamsBase {
  type: StxSignMessageTypes;
  network?: 'mainnet' | 'testnet' | 'devnet' | 'mocknet';
}

export interface StxSignMessageRequestParamsUtf8 extends StxSignMessageRequestParamsBase {
  type: 'utf8';
  message: string;
}

export interface StxSignMessageRequestParamsStructured extends StxSignMessageRequestParamsBase {
  type: 'structured';
  domain: string;
  message: string;
}

export type StxSignMessageRequestParams =
  | StxSignMessageRequestParamsUtf8
  | StxSignMessageRequestParamsStructured;

export interface StxSignMessageResponseBody {
  signature: string;
}

export type StxSignMessageRequest = RpcRequest<'stx_signMessage', StxSignMessageRequestParams>;

export type StxSignMessageResponse = RpcResponse<StxSignMessageResponseBody>;

export type DefineStxSignMessageMethod = DefineRpcMethod<
  StxSignMessageRequest,
  StxSignMessageResponse
>;
