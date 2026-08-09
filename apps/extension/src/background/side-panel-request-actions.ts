import { logger } from '@shared/logger';
import type { RouteUrls } from '@shared/route-urls';
import {
  cancelArmedSidePanelRequest,
  hideSidePanelRequestOverlay,
  resolveSidePanelDismissResponse,
  showSidePanelRequestOverlay,
} from '@shared/utils/side-panel';
import { isSidePanelOverlayActionMessage } from '@shared/utils/side-panel-request-overlay';

import { popup } from './popup';

interface DeferredSidePanelRequest {
  path: RouteUrls;
  popupUrl: string;
}

const deferredSidePanelRequests = new Map<number, DeferredSidePanelRequest>();

export function registerDeferredSidePanelRequest(tabId: number, request: DeferredSidePanelRequest) {
  if (!tabId) return;
  deferredSidePanelRequests.set(tabId, request);
}

export function clearDeferredSidePanelRequest(tabId: number) {
  deferredSidePanelRequests.delete(tabId);
}

export function initSidePanelOverlayActionListener() {
  chrome.runtime.onMessage.addListener((message, sender) => {
    if (!isSidePanelOverlayActionMessage(message)) return false;

    const tabId = sender.tab?.id;
    if (!tabId) return false;

    const request = deferredSidePanelRequests.get(tabId);
    deferredSidePanelRequests.delete(tabId);

    if (message.action === 'dismiss') {
      resolveSidePanelDismissResponse(tabId);
      void cancelArmedSidePanelRequest(tabId);
      return false;
    }

    // Must stay synchronous to keep the click's user activation
    chrome.sidePanel.open({ tabId }).then(
      () => {
        if (request) void showSidePanelRequestOverlay(tabId, request.path, 'pending');
      },
      (error: unknown) => {
        logger.warn('Unable to open side panel from overlay action', error);
        void hideSidePanelRequestOverlay(tabId);
        void cancelArmedSidePanelRequest(tabId);
        if (request) void popup({ url: request.popupUrl });
      }
    );

    return false;
  });
}
