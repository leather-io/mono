import { DefineRpcMethod, RpcParameterByName, RpcRequest, RpcResponse } from '../rpc/schemas';

export interface SendTransferRequestParams extends RpcParameterByName {
  account?: number;
  address: string;
  amount: string;
}

export interface SendTransferResponseBody {
  txid: string;
}

export type SendTransferRequest = RpcRequest<'sendTransfer', SendTransferRequestParams>;

export type SendTransferResponse = RpcResponse<SendTransferResponseBody>;

export type DefineSendTransferMethod = DefineRpcMethod<SendTransferRequest, SendTransferResponse>;
