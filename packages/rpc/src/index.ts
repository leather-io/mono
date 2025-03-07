import { z } from 'zod';

import { ValueOf } from '@leather.io/models';

import { sendTransfer } from './methods/bitcoin/send-transfer';
import { signMessage } from './methods/bitcoin/sign-message';
import { signPsbt } from './methods/bitcoin/sign-psbt';
import { getAddresses } from './methods/get-addresses';
import { getInfo } from './methods/get-info';
import { open } from './methods/open';
import { openSwap } from './methods/open-swap';
import { stxCallContract } from './methods/stacks/stx-call-contract';
import { stxDeployContract } from './methods/stacks/stx-deploy-contract';
import { stxGetAddresses } from './methods/stacks/stx-get-addresses';
import { stxGetNetworks } from './methods/stacks/stx-get-networks';
import { stxSignMessage } from './methods/stacks/stx-sign-message';
import { stxSignStructuredMessage } from './methods/stacks/stx-sign-structured-message';
import { stxSignTransaction } from './methods/stacks/stx-sign-transaction';
import { stxTransferSip9Nft } from './methods/stacks/stx-transfer-sip9-nft';
import { stxTransferSip10Ft } from './methods/stacks/stx-transfer-sip10-ft';
import { stxTransferStx } from './methods/stacks/stx-transfer-stx';
import { stxUpdateProfile } from './methods/stacks/stx-update-profile';
import { supportedMethods } from './methods/supported-methods';
import { ExtractErrorResponse, ExtractSuccessResponse } from './rpc/schemas';

export * from './rpc/schemas';
export * from './rpc/helpers';
export * from './methods/get-info';
export * from './methods/bitcoin/sign-psbt';
export * from './methods/get-addresses';
export * from './methods/bitcoin/send-transfer';
export * from './methods/bitcoin/sign-message';
export * from './methods/stacks/_clarity-values';
export * from './methods/stacks/_stacks-helpers';
export * from './methods/stacks/stx-sign-message';
export * from './methods/stacks/stx-sign-structured-message';
export * from './methods/stacks/stx-sign-transaction';
export * from './methods/stacks/stx-call-contract';
export * from './methods/stacks/stx-deploy-contract';
export * from './methods/stacks/stx-get-addresses';
export * from './methods/stacks/stx-transfer-sip9-nft';
export * from './methods/stacks/stx-transfer-sip10-ft';
export * from './methods/stacks/stx-transfer-stx';
export * from './methods/stacks/stx-update-profile';
export * from './methods/supported-methods';
export * from './methods/open';
export * from './methods/open-swap';

export const endpoints = {
  getAddresses,
  getInfo,
  open,
  openSwap,
  sendTransfer,
  signMessage,
  signPsbt,
  stxCallContract,
  stxDeployContract,
  stxGetAddresses,
  stxGetNetworks,
  stxSignMessage,
  stxSignStructuredMessage,
  stxSignTransaction,
  stxTransferSip10Ft,
  stxTransferSip9Nft,
  stxTransferStx,
  stxUpdateProfile,
  supportedMethods,
} as const;

type EndpointMap = (typeof endpoints)[keyof typeof endpoints];

/**
 * Request map keyed by exact method name e.g. `stx_signMessage`
 */
export type RpcEndpointMap = {
  [E in EndpointMap as E['method']]: {
    request: z.infer<E['request']>;
    response: z.infer<E['response']>;
  };
};

/** @deprecated */
export type LeatherRpcMethodMap = RpcEndpointMap;

export type RpcRequests = ValueOf<RpcEndpointMap>['request'];

export type RpcResponses = ValueOf<RpcEndpointMap>['response'];

export type RpcMethodNames = keyof RpcEndpointMap;

export interface RequestFn {
  <
    T extends RpcMethodNames,
    P extends RpcEndpointMap[T]['request'] extends { params?: infer P } ? P : never,
  >(
    arg: T,
    params: P
    // `Promise` throws if unsuccessful, so here we extract the successful response
  ): Promise<ExtractSuccessResponse<RpcEndpointMap[T]['response']>>;
  <T extends RpcMethodNames>(
    arg: T
    // `Promise` throws if unsuccessful, so here we extract the successful response
  ): Promise<ExtractSuccessResponse<RpcEndpointMap[T]['response']>>;
}

export interface ListenFn {
  (method: string, callback: () => void): () => void;
}

/**
 * Leather's provider object set on webpage global `window` object. Set this as
 * a global type object in your project.
 *
 * @example
 * ```
 * declare global {
 *   interface Window {
 *     LeatherProvider?: LeatherProvider;
 *   }
 * }
 * ```
 */
export interface LeatherProvider {
  /**
   * Request method. Takes a method name, and optional parameters
   * @returns Typed response for corresponding method
   */
  request: RequestFn;
  /**
   * Listen method. Takes an event name to listen for, and a callback function.
   * @returns An unsubscribe function
   */
  listen: ListenFn;
}

/**
 * Helper to create a successful RPC response object
 */
export function createRpcSuccessResponse<T extends RpcMethodNames>(
  _method: T,
  response: Omit<ExtractSuccessResponse<RpcEndpointMap[T]['response']>, 'jsonrpc'>
) {
  return { jsonrpc: '2.0', ...response } as ExtractSuccessResponse<RpcEndpointMap[T]['response']>;
}

/**
 * Helper to create an error RPC response object
 */
export function createRpcErrorResponse<T extends RpcMethodNames>(
  _method: T,
  error: Omit<ExtractErrorResponse<RpcEndpointMap[T]['response']>, 'jsonrpc'>
) {
  return { jsonrpc: '2.0', ...error } as RpcEndpointMap[T]['response'];
}
