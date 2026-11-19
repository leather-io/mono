import { z } from 'zod';

import { logger } from '@shared/logger';
import { InternalMethods, SIGN_OUT_MESSAGE } from '@shared/message-types';

import { applyPendingUpdate } from '@background/extension-update-monitor';
import { parseMonitoredAddresses, syncAddressMonitor } from '@background/monitors/address-monitor';

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

const internalMessageSchema = z.looseObject({
  method: z.string(),
  payload: z.unknown().optional(),
});

const monitoredAddressesPayloadSchema = z.looseObject({ addresses: z.array(z.unknown()) });

function getMonitoredAddressesFromPayload(payload: unknown) {
  const parsedPayload = monitoredAddressesPayloadSchema.safeParse(payload);
  if (!parsedPayload.success) {
    logger.warn('Ignoring an address monitor update without an address list');
    return null;
  }
  return parseMonitoredAddresses(parsedPayload.data.addresses);
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

  const parsedMessage = internalMessageSchema.safeParse(message);
  if (!parsedMessage.success) {
    sendResponse();
    return;
  }
  const internalMessage = parsedMessage.data;

  logInternalMessage(internalMessage);

  switch (internalMessage.method) {
    case InternalMethods.AddressMonitorUpdated: {
      const addresses = getMonitoredAddressesFromPayload(internalMessage.payload);
      if (addresses) await syncAddressMonitor(addresses);
      break;
    }
    case InternalMethods.ApplyPendingUpdate:
      await applyPendingUpdate();
      break;
    default:
      break;
  }

  const method: string = internalMessage.method;
  if (method === SIGN_OUT_MESSAGE) {
    await syncAddressMonitor([]);
  }

  sendResponse();
}
