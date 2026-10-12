import { logger } from '@shared/logger';
import { InternalMethods, SIGN_OUT_MESSAGE } from '@shared/message-types';
import { isRecord } from '@shared/utils/is-record';

import { applyPendingUpdate } from '@background/extension-update-monitor';
import { isMonitoredAddressList, syncAddressMonitor } from '@background/monitors/address-monitor';

function validateMessagesAreFromExtension(sender: chrome.runtime.MessageSender) {
  // Only respond to internal messages from our UI, not content scripts in other applications
  return sender.url?.startsWith(chrome.runtime.getURL(''));
}

function makeFormStateKey(tabId: number) {
  return 'form-state-' + tabId.toString();
}

async function removeFormState(tabId: number) {
  return chrome.storage.session.remove(makeFormStateKey(tabId));
}

// Remove any persisted form state when a tab is closed
chrome.tabs.onRemoved.addListener(tabId => void removeFormState(tabId));

interface InternalMessage {
  method: string;
  payload?: unknown;
}

function isInternalMessage(message: unknown): message is InternalMessage {
  return isRecord(message) && typeof message.method === 'string';
}

function getMonitoredAddressesFromPayload(payload: unknown) {
  if (!isRecord(payload) || !isMonitoredAddressList(payload.addresses)) return null;
  return payload.addresses;
}

function logInternalMessage(message: { method: string }) {
  logger.debug('Internal message', message);
}

export async function internalBackgroundMessageHandler(
  message: unknown,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void
) {
  if (!validateMessagesAreFromExtension(sender)) {
    logger.error('Error: Received background script msg from ' + sender.url);
    sendResponse();
    return;
  }

  if (!isInternalMessage(message)) {
    sendResponse();
    return;
  }

  logInternalMessage(message);

  switch (message.method) {
    case InternalMethods.AddressMonitorUpdated: {
      const addresses = getMonitoredAddressesFromPayload(message.payload);
      if (addresses) await syncAddressMonitor(addresses);
      break;
    }
    case InternalMethods.ApplyPendingUpdate:
      await applyPendingUpdate();
      break;
    default:
      break;
  }

  const method: string = message.method;
  if (method === SIGN_OUT_MESSAGE) {
    await syncAddressMonitor([]);
  }

  sendResponse();
}
