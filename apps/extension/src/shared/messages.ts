import {
  type InternalMethods,
  type Message,
  SIGN_OUT_MESSAGE,
  WALLET_LIST_CHANGED_MESSAGE,
  WALLET_LOCK_MESSAGE,
} from '@shared/message-types';
import { isRecord } from '@shared/utils/is-record';

import type { MonitoredAddress } from '@background/monitors/address-monitor';

/**
 * Popup <-> Background Script
 */
type BackgroundMessage<Msg extends InternalMethods, Payload = undefined> = Message<Msg, Payload>;

type OriginatingTabClosed = BackgroundMessage<
  typeof InternalMethods.OriginatingTabClosed,
  { tabId: number }
>;

type AddressMonitorUpdated = BackgroundMessage<
  typeof InternalMethods.AddressMonitorUpdated,
  { addresses: MonitoredAddress[] }
>;

type ApplyPendingUpdate = BackgroundMessage<typeof InternalMethods.ApplyPendingUpdate>;

export type BackgroundMessages = OriginatingTabClosed | AddressMonitorUpdated | ApplyPendingUpdate;

export function sendMessage(message: BackgroundMessages) {
  return chrome.runtime.sendMessage(message);
}

function getMessageMethod(message: unknown) {
  return isRecord(message) ? message.method : undefined;
}

export function broadcastWalletLock() {
  return chrome.runtime.sendMessage({ method: WALLET_LOCK_MESSAGE });
}

export function addWalletLockListener(handler: () => void) {
  chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    if (getMessageMethod(message) === WALLET_LOCK_MESSAGE) handler();
    sendResponse();
  });
}

export function broadcastSignOut() {
  return chrome.runtime.sendMessage({ method: SIGN_OUT_MESSAGE });
}

export function addSignOutListener(handler: () => void) {
  chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    if (getMessageMethod(message) === SIGN_OUT_MESSAGE) handler();
    sendResponse();
  });
}

interface WalletListChangedPayload {
  removedFingerprint?: string;
}

function isWalletListChangedPayload(payload: unknown): payload is WalletListChangedPayload {
  return (
    isRecord(payload) &&
    (payload.removedFingerprint === undefined || typeof payload.removedFingerprint === 'string')
  );
}

export function broadcastWalletListChanged(payload: WalletListChangedPayload) {
  return chrome.runtime.sendMessage({ method: WALLET_LIST_CHANGED_MESSAGE, payload });
}

export function addWalletListChangedListener(handler: (payload: WalletListChangedPayload) => void) {
  chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    if (isRecord(message) && message.method === WALLET_LIST_CHANGED_MESSAGE)
      handler(isWalletListChangedPayload(message.payload) ? message.payload : {});
    sendResponse();
  });
}
