import type { AccountId } from '@leather.io/models';

import {
  ExtensionMethods,
  InternalMethods,
  Message,
  WALLET_LOCK_MESSAGE,
} from '@shared/message-types';

import type { MonitoredAddress } from '@background/monitors/address-monitor';

/**
 * Popup <-> Background Script
 */
type BackgroundMessage<Msg extends ExtensionMethods, Payload = undefined> = Omit<
  Message<Msg, Payload>,
  'source'
>;

type OriginatingTabClosed = BackgroundMessage<
  InternalMethods.OriginatingTabClosed,
  { tabId: number }
>;

type AccountChanged = BackgroundMessage<InternalMethods.AccountChanged, AccountId>;

type AddressMonitorUpdated = BackgroundMessage<
  InternalMethods.AddressMonitorUpdated,
  { addresses: MonitoredAddress[] }
>;

export type BackgroundMessages = OriginatingTabClosed | AccountChanged | AddressMonitorUpdated;

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
