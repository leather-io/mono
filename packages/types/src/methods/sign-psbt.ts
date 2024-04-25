import { DefineRpcMethod, RpcRequest, RpcResponse } from '../rpc';

/**
 * ALL           -- all inputs, all outputs
 * NONE          -- all inputs, no outputs
 * SINGLE        -- all inputs, one output of the same index
 * ALL + ANYONE  -- one input, all outputs
 * NONE + ANYONE -- one input, no outputs
 * SINGLE        -- one inputs, one output of the same index
 */
export enum SignatureHash {
  ALL = 0x01,
  NONE = 0x02,
  SINGLE = 0x03,
  ALL_ANYONECANPAY = 0x81,
  NONE_ANYONECANPAY = 0x82,
  SINGLE_ANYONECANPAY = 0x83,
}

export interface SignPsbtRequestParams {
  account?: number;
  allowedSighash?: SignatureHash[];
  hex: string;
  signAtIndex?: number | number[];
}

export interface SignPsbtResponseBody {
  txid?: string;
  hex: string;
}

export type SignPsbtRequest = RpcRequest<'signPsbt', SignPsbtRequestParams>;

export type SignPsbtResponse = RpcResponse<SignPsbtResponseBody>;

export type DefineSignPsbtMethod = DefineRpcMethod<SignPsbtRequest, SignPsbtResponse>;
