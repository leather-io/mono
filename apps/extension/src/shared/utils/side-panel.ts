import { delay, isObject } from '@leather.io/utils';

import { logger } from '@shared/logger';
import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { RouteUrls } from '@shared/route-urls';
import { getRootState } from '@shared/storage/get-root-state';
import {
  type SidePanelRequestOverlayMessage,
  sidePanelRequestOverlayMessageType,
} from '@shared/utils/side-panel-request-overlay';

import type { RootState } from '@app/store';

export const sidePanelPage = 'side-panel.html';

const actionPopupPage = 'action-popup.html';

const pendingSidePanelRequestKey = 'pendingSidePanelRequest';

const sidePanelRequestPortPrefix = 'side-panel-request:';

type MaybePreMultiWalletRootState = Omit<RootState, 'wallets'> & {
  wallets?: RootState['wallets'];
};

async function hasWalletSetUp() {
  try {
    const state: MaybePreMultiWalletRootState | null = await getRootState();
    if (!state) return false;
    const walletEntities = state.wallets?.entities;
    if (!walletEntities) return false;
    return Object.keys(walletEntities).length > 0;
  } catch (error) {
    logger.debug('Unable to read wallet state', error);
    return false;
  }
}

function isSidePanelSupported() {
  return typeof chrome !== 'undefined' && typeof chrome.sidePanel !== 'undefined';
}

export function isSidePanelPage() {
  return (
    typeof document !== 'undefined' && document.location.pathname.startsWith(`/${sidePanelPage}`)
  );
}

async function syncSidePanelAvailability() {
  if (!isSidePanelSupported()) return;
  try {
    if (await hasWalletSetUp()) {
      await chrome.action.setPopup({ popup: '' });
      await chrome.sidePanel.setOptions({ enabled: true, path: sidePanelPage });
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
      return;
    }
    await chrome.action.setPopup({ popup: actionPopupPage });
    await chrome.sidePanel.setOptions({ enabled: false });
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
  } catch (error) {
    logger.warn('Unable to sync side panel availability', error);
  }
}

export function initSidePanelAvailabilitySync() {
  void syncSidePanelAvailability();
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !changes['persist:root']) return;
    void syncSidePanelAvailability();
  });
}

export function openSidePanelForDappRequest(tabId: number) {
  if (!isSidePanelSupported() || !tabId) return;
  chrome.sidePanel.open({ tabId }).then(
    () => logger.debug('Side panel opened for dapp request'),
    (error: unknown) => logger.debug('Side panel did not open for dapp request', error)
  );
}

async function sendSidePanelRequestOverlayMessage(
  tabId: number,
  message: SidePanelRequestOverlayMessage
) {
  try {
    await chrome.tabs.sendMessage(tabId, message, { frameId: 0 });
  } catch (error) {
    logger.debug('Unable to update side panel request overlay', error);
  }
}

export function showSidePanelRequestOverlay(tabId: number, path: RouteUrls) {
  return sendSidePanelRequestOverlayMessage(tabId, {
    type: sidePanelRequestOverlayMessageType,
    action: 'show',
    path,
  });
}

function hideSidePanelRequestOverlay(tabId: number) {
  return sendSidePanelRequestOverlayMessage(tabId, {
    type: sidePanelRequestOverlayMessageType,
    action: 'hide',
  });
}

async function resetSidePanelToDefault(tabId: number) {
  if (!isSidePanelSupported() || !tabId) return;
  try {
    await chrome.sidePanel.setOptions({ tabId, path: sidePanelPage, enabled: true });
  } catch (error) {
    logger.debug('Unable to reset side panel path', error);
  }
}

async function isSidePanelShowing() {
  try {
    const panelUrlPrefix = chrome.runtime.getURL(sidePanelPage);
    const contexts = await chrome.runtime.getContexts({});
    return contexts.some(context => (context.documentUrl ?? '').startsWith(panelUrlPrefix));
  } catch (error) {
    logger.debug('Unable to inspect side panel contexts', error);
    return false;
  }
}

async function setPendingSidePanelRequest(url: string) {
  await chrome.storage.session.set({ [pendingSidePanelRequestKey]: { url } });
}

async function clearPendingSidePanelRequest() {
  await chrome.storage.session.remove(pendingSidePanelRequestKey);
}

async function consumePendingSidePanelRequest() {
  const data = await chrome.storage.session.get(pendingSidePanelRequestKey);
  const pending: unknown = data[pendingSidePanelRequestKey];
  if (!isObject(pending) || !('url' in pending) || typeof pending.url !== 'string') return;
  const target = chrome.runtime.getURL(pending.url);
  await clearPendingSidePanelRequest();
  if (window.location.href === target) return;
  requestLifecyclePort?.postMessage({ handoff: true });
  window.location.replace(target);
  window.location.reload();
}

export function initSidePanelPendingRequestWatcher() {
  if (!isSidePanelPage()) return;
  void consumePendingSidePanelRequest();
  chrome.storage.session.onChanged.addListener(changes => {
    if (changes[pendingSidePanelRequestKey]?.newValue) void consumePendingSidePanelRequest();
  });
}

interface OpenRequestInSidePanelArgs {
  tabId: number;
  url: string;
}
export async function openRequestInSidePanel({ tabId, url }: OpenRequestInSidePanelArgs) {
  if (!isSidePanelSupported() || !tabId) return false;
  if (!(await hasWalletSetUp())) return false;

  try {
    await chrome.sidePanel.setOptions({ tabId, path: url, enabled: true });
  } catch (error) {
    logger.warn('Unable to set side panel request path', error);
    return false;
  }

  try {
    await chrome.sidePanel.open({ tabId });
  } catch (error) {
    await delay(200);
    if (!(await isSidePanelShowing())) {
      logger.warn('Unable to open request in side panel, falling back to popup window', error);
      await resetSidePanelToDefault(tabId);
      return false;
    }
  }

  await setPendingSidePanelRequest(url);
  return true;
}

function getRequestingTabIdFromLocation() {
  const params = new URLSearchParams(window.location.href.split('?')[1]);
  return Number(params.get('tabId') ?? '0');
}

let requestLifecyclePort: chrome.runtime.Port | null = null;

export function connectSidePanelRequestLifecyclePort() {
  if (!isSidePanelPage()) return;
  const tabId = getRequestingTabIdFromLocation();
  if (!tabId) return;
  requestLifecyclePort = chrome.runtime.connect({ name: `${sidePanelRequestPortPrefix}${tabId}` });
}

interface SidePanelDismissResponse {
  frameId: number;
  tabId: number;
  response: unknown;
}
const sidePanelDismissResponses = new Map<number, SidePanelDismissResponse>();

export function registerSidePanelDismissResponse(entry: SidePanelDismissResponse) {
  if (!entry.tabId) return;
  sidePanelDismissResponses.set(entry.tabId, entry);
}

export function initSidePanelRequestLifecycleListener() {
  if (!isSidePanelSupported()) return;
  chrome.runtime.onConnect.addListener(port => {
    if (!port.name.startsWith(sidePanelRequestPortPrefix)) return;
    const tabId = Number(port.name.slice(sidePanelRequestPortPrefix.length));
    let handedOff = false;
    port.onMessage.addListener(message => {
      if (isObject(message) && 'handoff' in message) handedOff = true;
    });
    port.onDisconnect.addListener(() => {
      if (handedOff) return;
      void hideSidePanelRequestOverlay(tabId);
      const entry = sidePanelDismissResponses.get(tabId);
      if (!entry) return;
      sidePanelDismissResponses.delete(tabId);
      void sendMessageToOriginatingFrame(
        { frameId: entry.frameId, tabId: entry.tabId },
        entry.response
      );
    });
  });
}

export function returnSidePanelToHome() {
  const tabId = getRequestingTabIdFromLocation();
  void clearPendingSidePanelRequest();
  void hideSidePanelRequestOverlay(tabId);
  void resetSidePanelToDefault(tabId).finally(() => {
    window.location.replace(chrome.runtime.getURL(sidePanelPage));
  });
}
