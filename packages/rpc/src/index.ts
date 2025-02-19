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
import { stxSignMessage } from './methods/stacks/stx-sign-message';
import { stxSignStructuredMessage } from './methods/stacks/stx-sign-structured-message';
import { stxSignTransaction } from './methods/stacks/stx-sign-transaction';
import { stxTransferSip10Ft } from './methods/stacks/stx-transfer-sip10-ft';
import { stxTransferStx } from './methods/stacks/stx-transfer-stx';
import { stxUpdateProfile } from './methods/stacks/stx-update-profile';
import { supportedMethods } from './methods/supported-methods';
import { ExtractErrorResponse, ExtractSuccessResponse } from './rpc/schemas';

export * from './rpc/schemas';
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
export * from './methods/stacks/stx-transfer-sip10-ft';
export * from './methods/stacks/stx-transfer-stx';
export * from './methods/stacks/stx-update-profile';
export * from './methods/supported-methods';
export * from './methods/open';
export * from './methods/open-swap';

export const endpoints = {
  open,
  getInfo,
  supportedMethods,
  openSwap,
  getAddresses,
  stxUpdateProfile,
  stxSignMessage,
  stxTransferStx,
  stxTransferSip10Ft,
  stxSignTransaction,
  stxSignStructuredMessage,
  stxGetAddresses,
  stxDeployContract,
  stxCallContract,
  signPsbt,
  signMessage,
  sendTransfer,
};

type EndpointMap = (typeof endpoints)[keyof typeof endpoints];

export type LeatherRpcMethodMap = {
  [E in EndpointMap as E['method']]: {
    request: z.infer<E['request']>;
    response: z.infer<E['response']>;
  };
};

export type RpcRequests = ValueOf<LeatherRpcMethodMap>['request'];

export type RpcResponses = ValueOf<LeatherRpcMethodMap>['response'];

export type RpcMethodNames = keyof LeatherRpcMethodMap;

export interface RequestFn {
  <T extends RpcMethodNames>(
    arg: T,
    params?: LeatherRpcMethodMap[T]['request'] extends { params: infer P } ? P : never
    // `Promise` throws if unsuccessful, so here we extract the successful response
  ): Promise<ExtractSuccessResponse<LeatherRpcMethodMap[T]['response']>>;
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
  response: Omit<ExtractSuccessResponse<LeatherRpcMethodMap[T]['response']>, 'jsonrpc'>
) {
  return { jsonrpc: '2.0', ...response } as ExtractSuccessResponse<
    LeatherRpcMethodMap[T]['response']
  >;
}

/**
 * Helper to create an error RPC response object
 */
export function createRpcErrorResponse<T extends RpcMethodNames>(
  _method: T,
  error: Omit<ExtractErrorResponse<LeatherRpcMethodMap[T]['response']>, 'jsonrpc'>
) {
  return { jsonrpc: '2.0', ...error } as LeatherRpcMethodMap[T]['response'];
}
