import type { UnknownAction } from '@reduxjs/toolkit';

import type { AccountId } from '@leather.io/models';

import {
  ExtensionMethods,
  InternalMethods,
  Message,
  REPLAY_ACTION_MESSAGE,
  WALLET_LIST_CHANGED_MESSAGE,
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

export function broadcastReplayAction(action: UnknownAction) {
  return chrome.runtime.sendMessage({ method: REPLAY_ACTION_MESSAGE, action });
}

export function addReplayActionListener(handler: (action: UnknownAction) => void) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.method === REPLAY_ACTION_MESSAGE) handler(message.action);
    sendResponse();
  });
}
