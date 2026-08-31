import {
  InternalMethods,
  Message,
  SIGN_OUT_MESSAGE,
  WALLET_LIST_CHANGED_MESSAGE,
  WALLET_LOCK_MESSAGE,
} from '@shared/message-types';

import type { MonitoredAddress } from '@background/monitors/address-monitor';

/**
 * Popup <-> Background Script
 */
type BackgroundMessage<Msg extends InternalMethods, Payload = undefined> = Message<Msg, Payload>;

type OriginatingTabClosed = BackgroundMessage<
  InternalMethods.OriginatingTabClosed,
  { tabId: number }
>;

type AddressMonitorUpdated = BackgroundMessage<
  InternalMethods.AddressMonitorUpdated,
  { addresses: MonitoredAddress[] }
>;

export type BackgroundMessages = OriginatingTabClosed | AddressMonitorUpdated;

export function sendMessage(message: BackgroundMessages) {
  return chrome.runtime.sendMessage(message);
}

export function broadcastWalletLock() {
  return chrome.runtime.sendMessage({ method: WALLET_LOCK_MESSAGE });
}

export function addWalletLockListener(handler: () => void) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.method === WALLET_LOCK_MESSAGE) handler();
    sendResponse();
  });
}

export function broadcastSignOut() {
  return chrome.runtime.sendMessage({ method: SIGN_OUT_MESSAGE });
}

export function addSignOutListener(handler: () => void) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.method === SIGN_OUT_MESSAGE) handler();
    sendResponse();
  });
}

interface WalletListChangedPayload {
  removedFingerprint?: string;
}

export function broadcastWalletListChanged(payload: WalletListChangedPayload) {
  return chrome.runtime.sendMessage({ method: WALLET_LIST_CHANGED_MESSAGE, payload });
}

export function addWalletListChangedListener(handler: (payload: WalletListChangedPayload) => void) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.method === WALLET_LIST_CHANGED_MESSAGE) handler(message.payload ?? {});
    sendResponse();
  });
}
