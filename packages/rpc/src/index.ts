import { ValueOf } from '@leather.io/models';

import { DefineGetAddressesMethod } from './methods/get-addresses';
import { DefineGetInfoMethod } from './methods/get-info';
import { DefineSendTransferMethod } from './methods/send-transfer';
import { DefineSignMessageMethod } from './methods/sign-message';
import { DefineSignPsbtMethod } from './methods/sign-psbt';
import { DefineStxSignMessageMethod } from './methods/stx-sign-message';
import { DefineStxSignTransactionMethod } from './methods/stx-sign-transaction';
import { ExtractErrorResponse, ExtractSuccessResponse } from './rpc/schemas';

export * from './rpc/schemas';
export * from './methods/get-info';
export * from './methods/sign-psbt';
export * from './methods/get-addresses';
export * from './methods/send-transfer';
export * from './methods/sign-message';
export * from './methods/stx-sign-message';

export * from './schemas/network-schemas';
export * from './schemas/validators';

export type LeatherRpcMethodMap = DefineGetInfoMethod &
  DefineGetAddressesMethod &
  DefineSignPsbtMethod &
  DefineSignMessageMethod &
  DefineSendTransferMethod &
  DefineStxSignMessageMethod &
  DefineStxSignTransactionMethod;

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
