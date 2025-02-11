import { ValueOf } from '@leather.io/models';

import { DefineSendTransferMethod } from './methods/bitcoin/send-transfer';
import { DefineSignMessageMethod } from './methods/bitcoin/sign-message';
import { DefineSignPsbtMethod } from './methods/bitcoin/sign-psbt';
import { DefineGetAddressesMethod } from './methods/get-addresses';
import { DefineGetInfoMethod } from './methods/get-info';
import { DefineOpenMethod } from './methods/open';
import { DefineOpenSwapMethod } from './methods/open-swap';
import { DefineStxCallContractMethod } from './methods/stacks/stx-call-contract';
import { DefineStxDeployContractMethod } from './methods/stacks/stx-deploy-contract';
import { DefineStxGetAddressesMethod } from './methods/stacks/stx-get-addresses';
import { DefineStxSignMessageMethod } from './methods/stacks/stx-sign-message';
import { DefineStxSignStructuredMessageMethod } from './methods/stacks/stx-sign-structured-message';
import { DefineStxSignTransactionMethod } from './methods/stacks/stx-sign-transaction';
import { DefineStxTransferSip10FtMethod } from './methods/stacks/stx-transfer-sip10-ft';
import { DefineStxTransferStxMethod } from './methods/stacks/stx-transfer-stx';
import { DefineStxUpdateProfileMethod } from './methods/stacks/stx-update-profile';
import { DefineSupportedMethods } from './methods/supported-methods';
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

export type LeatherRpcMethodMap =
  // Chain agnostic
  DefineGetInfoMethod &
    DefineOpenMethod &
    DefineSupportedMethods &
    DefineGetAddressesMethod &
    DefineOpenSwapMethod &
    // Bitcoin
    DefineSignPsbtMethod &
    DefineSignMessageMethod &
    DefineSendTransferMethod &
    // Stacks
    DefineStxGetAddressesMethod &
    DefineStxSignMessageMethod &
    DefineStxSignStructuredMessageMethod &
    DefineStxSignTransactionMethod &
    DefineStxCallContractMethod &
    DefineStxDeployContractMethod &
    DefineStxTransferSip10FtMethod &
    DefineStxTransferStxMethod &
    DefineStxUpdateProfileMethod;

export type RpcRequests = ValueOf<LeatherRpcMethodMap>['request'];

export type RpcResponses = ValueOf<LeatherRpcMethodMap>['response'];

export type MethodNames = keyof LeatherRpcMethodMap;

export interface RequestFn {
  <T extends MethodNames>(
    arg: T,
    params?: object | string[]
    // `Promise` throws if unsucessful, so here we extract the successful response
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

export function createRpcSuccessResponse<T extends MethodNames>(
  _method: T,
  response: Omit<ExtractSuccessResponse<LeatherRpcMethodMap[T]['response']>, 'jsonrpc'>
) {
  return { jsonrpc: '2.0', ...response } as ExtractSuccessResponse<
    LeatherRpcMethodMap[T]['response']
  >;
}

export function createRpcErrorResponse<T extends MethodNames>(
  _method: T,
  error: Omit<ExtractErrorResponse<LeatherRpcMethodMap[T]['response']>['error'], 'jsonrpc'>
) {
  return { jsonrpc: '2.0', error } as ExtractErrorResponse<LeatherRpcMethodMap[T]['response']>;
}
