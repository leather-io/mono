import z from 'zod';

import {
  clearPendingUpdateVersion,
  extensionUpdateStorageKeys,
  setAppliedUpdateVersion,
  setPendingUpdateVersion,
} from '@shared/extension-update';
import { logger } from '@shared/logger';

import { queueAnalyticsRequest } from './background-analytics';

const requestWindowTeardownMs = 250;

const updateTimingSchema = z.object({
  availableAt: z.number(),
  requestedUpdateNow: z.boolean(),
});

type UpdateTiming = z.infer<typeof updateTimingSchema>;

async function getUpdateTiming() {
  const result = await chrome.storage.local.get(extensionUpdateStorageKeys.updateTiming);
  const parsed = updateTimingSchema.safeParse(result[extensionUpdateStorageKeys.updateTiming]);
  return parsed.success ? parsed.data : null;
}

async function setUpdateTiming(timing: UpdateTiming) {
  return chrome.storage.local.set({ [extensionUpdateStorageKeys.updateTiming]: timing });
}

async function recordUpdateAvailable() {
  if (await getUpdateTiming()) return;
  await setUpdateTiming({ availableAt: Date.now(), requestedUpdateNow: false });
}

async function recordUpdateNowRequested() {
  const timing = await getUpdateTiming();
  if (!timing) return;
  await setUpdateTiming({ ...timing, requestedUpdateNow: true });
}

async function reportAppliedUpdate() {
  const timing = await getUpdateTiming();
  await chrome.storage.local.remove(extensionUpdateStorageKeys.updateTiming);
  if (!timing) return;
  await queueAnalyticsRequest('extension_update_applied', {
    msSinceAvailable: Date.now() - timing.availableAt,
    appliedVia: timing.requestedUpdateNow ? 'update_now' : 'automatic',
  });
}

export function initExtensionUpdateMonitor() {
  chrome.runtime.onUpdateAvailable.addListener(details => {
    setPendingUpdateVersion(details.version).catch(e =>
      logger.error('Unable to store the pending extension update version: ', e)
    );
    recordUpdateAvailable().catch(e =>
      logger.error('Unable to record when the extension update became available: ', e)
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
    reportAppliedUpdate().catch(e =>
      logger.error('Unable to report the applied extension update: ', e)
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
  await recordUpdateNowRequested().catch(e =>
    logger.error('Unable to record that the extension update was requested: ', e)
  );
  await closeOpenRequestWindows().catch(e =>
    logger.error('Unable to close open request windows before updating: ', e)
  );
  await clearPendingUpdateVersion().catch(e =>
    logger.error('Unable to clear the pending extension update version: ', e)
  );
  chrome.runtime.reload();
}
