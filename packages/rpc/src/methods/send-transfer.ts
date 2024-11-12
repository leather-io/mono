import { DefineRpcMethod, RpcRequest, RpcResponse } from '../rpc/schemas';

export interface SendTransferRequestParams {
  account?: number;
  address: string;
  amount: string;
  [x: string]: unknown;
}

export interface SendTransferResponseBody {
  txid: string;
}

export type SendTransferRequest = RpcRequest<'sendTransfer', SendTransferRequestParams>;

export type SendTransferResponse = RpcResponse<SendTransferResponseBody>;

export type DefineSendTransferMethod = DefineRpcMethod<SendTransferRequest, SendTransferResponse>;
