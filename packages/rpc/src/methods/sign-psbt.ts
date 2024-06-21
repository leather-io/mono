import { DefaultNetworkConfigurations } from '@leather.io/models';

import { DefineRpcMethod, RpcRequest, RpcResponse } from '../rpc';

/**
 * DEFAULT       -- all inputs, all outputs
 * ALL           -- all inputs, all outputs
 * NONE          -- all inputs, no outputs
 * SINGLE        -- all inputs, one output of the same index
 * ALL + ANYONE  -- one input, all outputs
 * NONE + ANYONE -- one input, no outputs
 * SINGLE        -- one inputs, one output of the same index
 */
export enum SignatureHash {
  DEFAULT = 0x00,
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
  broadcast: boolean;
  hex: string;
  network: DefaultNetworkConfigurations;
  signAtIndex?: number | number[];
}

export interface SignPsbtResponseBody {
  hex: string;
  txid?: string;
}

export type SignPsbtRequest = RpcRequest<'signPsbt', SignPsbtRequestParams>;

export type SignPsbtResponse = RpcResponse<SignPsbtResponseBody>;

export type DefineSignPsbtMethod = DefineRpcMethod<SignPsbtRequest, SignPsbtResponse>;
