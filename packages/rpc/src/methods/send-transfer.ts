import { DefineRpcMethod, RpcParameterByName, RpcRequest, RpcResponse } from '../rpc/schemas';

export interface SendTransferRequestParams extends RpcParameterByName {
  account?: number;
  address: string;
  amount: string;
}

export interface RpcSendTransferParamsLegacy extends SendTransferRequestParams {
  network: string;
}

interface TransferRecipientParam {
  address: string;
  amount: string;
}

export interface RpcSendTransferParams extends RpcParameterByName {
  account?: number;
  recipients: TransferRecipientParam[];
  network: string;
}

export interface SendTransferResponseBody {
  txid: string;
}

export type SendTransferRequest = RpcRequest<
  'sendTransfer',
  SendTransferRequestParams | RpcSendTransferParams
>;

export type SendTransferResponse = RpcResponse<SendTransferResponseBody>;

export type DefineSendTransferMethod = DefineRpcMethod<SendTransferRequest, SendTransferResponse>;
