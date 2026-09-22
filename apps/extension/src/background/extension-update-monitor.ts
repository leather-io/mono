import {
  clearPendingUpdateVersion,
  setAppliedUpdateVersion,
  setPendingUpdateVersion,
} from '@shared/extension-update';
import { logger } from '@shared/logger';

const requestWindowTeardownMs = 250;

export function initExtensionUpdateMonitor() {
  chrome.runtime.onUpdateAvailable.addListener(details => {
    setPendingUpdateVersion(details.version).catch(e =>
      logger.error('Unable to store the pending extension update version: ', e)
    );
  });

  chrome.runtime.onInstalled.addListener(details => {
    if (details.reason !== 'update') return;
    clearPendingUpdateVersion().catch(e =>
      logger.error('Unable to clear the pending extension update version: ', e)
    );
    setAppliedUpdateVersion(chrome.runtime.getManifest().version).catch(e =>
      logger.error('Unable to store the applied extension update version: ', e)
    );
  });
}

async function closeOpenRequestWindows() {
  const extensionUrlPrefix = chrome.runtime.getURL('index.html');
  const windows = await chrome.windows.getAll({ populate: true });
  const requestWindowIds = windows
    .filter(browserWindow =>
      browserWindow.tabs?.some(
        tab => tab.url?.startsWith(extensionUrlPrefix) && tab.url.includes('origin=')
      )
    )
    .map(browserWindow => browserWindow.id)
    .filter(windowId => typeof windowId === 'number');

  await Promise.all(requestWindowIds.map(windowId => chrome.windows.remove(windowId)));

  if (requestWindowIds.length === 0) return;
  await new Promise(resolve => setTimeout(resolve, requestWindowTeardownMs));
}

export async function applyPendingUpdate() {
  await closeOpenRequestWindows().catch(e =>
    logger.error('Unable to close open request windows before updating: ', e)
  );
  await clearPendingUpdateVersion().catch(e =>
    logger.error('Unable to clear the pending extension update version: ', e)
  );
  chrome.runtime.reload();
}
