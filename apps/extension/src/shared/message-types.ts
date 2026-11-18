export const CONTENT_SCRIPT_PORT = 'content-script';

export const WALLET_LOCK_MESSAGE = 'wallet/lock';

export const SIGN_OUT_MESSAGE = 'wallet/sign-out';

export const WALLET_LIST_CHANGED_MESSAGE = 'wallet/list-changed';

export const InternalMethods = {
  OriginatingTabClosed: 'OriginatingTabClosed',
  AddressMonitorUpdated: 'AddressMonitorUpdated',
  ApplyPendingUpdate: 'ApplyPendingUpdate',
} as const;
export type InternalMethods = (typeof InternalMethods)[keyof typeof InternalMethods];

/**
 * Content Script <-> Background Script
 */
export interface Message<Methods extends InternalMethods, Payload = undefined> {
  method: Methods;
  payload: Payload;
}
