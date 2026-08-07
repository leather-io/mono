export const CONTENT_SCRIPT_PORT = 'content-script';

export const WALLET_LOCK_MESSAGE = 'wallet/lock';

export const SIGN_OUT_MESSAGE = 'wallet/sign-out';

export const WALLET_LIST_CHANGED_MESSAGE = 'wallet/list-changed';

export enum InternalMethods {
  OriginatingTabClosed = 'OriginatingTabClosed',
  AddressMonitorUpdated = 'AddressMonitorUpdated',
}

/**
 * Content Script <-> Background Script
 */
export interface Message<Methods extends InternalMethods, Payload = undefined> {
  method: Methods;
  payload: Payload;
}
