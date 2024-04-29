import { ValueOf } from '@leather-wallet/models';

import { DefineGetAddressesMethod } from './methods/get-addresses';
import { DefineGetInfoMethod } from './methods/get-info';
import { DefineSendTransferMethod } from './methods/send-transfer';
import { DefineSignMessageMethod } from './methods/sign-message';
import { DefineSignPsbtMethod } from './methods/sign-psbt';
import { DefineStxSignMessageMethod } from './methods/stx-sign-message';
import { ExtractSuccessResponse } from './rpc';

export * from './rpc';
export * from './methods/get-info';
export * from './methods/sign-psbt';
export * from './methods/get-addresses';
export * from './methods/send-transfer';

export type MethodMap = DefineGetInfoMethod &
  DefineGetAddressesMethod &
  DefineSignPsbtMethod &
  DefineSignMessageMethod &
  DefineSendTransferMethod &
  DefineStxSignMessageMethod;

export type RpcRequests = ValueOf<MethodMap>['request'];

export type RpcResponses = ValueOf<MethodMap>['response'];

export type MethodNames = keyof MethodMap;

export interface RequestFn {
  <T extends MethodNames>(
    arg: T,
    params?: object | string[]
    // `Promise` throws if unsucessful, so here we extract the successful response
  ): Promise<ExtractSuccessResponse<MethodMap[T]['response']>>;
}

export interface ListenFn {
  (method: string, callback: () => void): () => void;
}

declare global {
  interface Window {
    LeatherProvider?: {
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
    };
  }
}
