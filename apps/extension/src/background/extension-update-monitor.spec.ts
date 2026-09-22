import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { applyPendingUpdate, initExtensionUpdateMonitor } from './extension-update-monitor';

const mocks = vi.hoisted(() => ({
  queueAnalyticsRequest: vi.fn(),
}));

vi.mock('./background-analytics', () => ({
  queueAnalyticsRequest: mocks.queueAnalyticsRequest,
}));

interface Listeners {
  onUpdateAvailable?(details: { version: string }): void;
  onInstalled?(details: { reason: string }): void;
}

function createStorageArea() {
  const store = new Map<string, unknown>();
  return {
    get(key: string) {
      return Promise.resolve(store.has(key) ? { [key]: store.get(key) } : {});
    },
    set(items: Record<string, unknown>) {
      Object.entries(items).forEach(([key, value]) => store.set(key, value));
      return Promise.resolve();
    },
    remove(keys: string | string[]) {
      [keys].flat().forEach(key => store.delete(key));
      return Promise.resolve();
    },
  };
}

async function flushListeners() {
  for (let tick = 0; tick < 5; tick++) await new Promise(resolve => setTimeout(resolve, 0));
}

const announcedAt = new Date('2026-09-25T10:00:00Z').getTime();
const minuteMs = 60_000;

let listeners: Listeners;

beforeEach(() => {
  listeners = {};
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(announcedAt);
  vi.stubGlobal('chrome', {
    runtime: {
      onUpdateAvailable: {
        addListener(listener: Listeners['onUpdateAvailable']) {
          listeners.onUpdateAvailable = listener;
        },
      },
      onInstalled: {
        addListener(listener: Listeners['onInstalled']) {
          listeners.onInstalled = listener;
        },
      },
      getManifest: () => ({ version: '6.113.0' }),
      getURL: (path: string) => `chrome-extension://leather/${path}`,
      reload: vi.fn(),
    },
    storage: { local: createStorageArea(), session: createStorageArea() },
    windows: { getAll: () => Promise.resolve([]), remove: vi.fn() },
  });
  initExtensionUpdateMonitor();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('extension update timing', () => {
  test('reports an update Chrome applied on its own', async () => {
    listeners.onUpdateAvailable?.({ version: '6.113.0' });
    await flushListeners();

    vi.setSystemTime(announcedAt + 45 * minuteMs);
    listeners.onInstalled?.({ reason: 'update' });
    await flushListeners();

    expect(mocks.queueAnalyticsRequest).toHaveBeenCalledWith('extension_update_applied', {
      msSinceAvailable: 45 * minuteMs,
      appliedVia: 'automatic',
    });
  });

  test('reports an update applied with Update now', async () => {
    listeners.onUpdateAvailable?.({ version: '6.113.0' });
    await flushListeners();

    vi.setSystemTime(announcedAt + 2 * minuteMs);
    await applyPendingUpdate();
    listeners.onInstalled?.({ reason: 'update' });
    await flushListeners();

    expect(mocks.queueAnalyticsRequest).toHaveBeenCalledWith('extension_update_applied', {
      msSinceAvailable: 2 * minuteMs,
      appliedVia: 'update_now',
    });
  });

  test('measures from the first announcement when Chrome announces again', async () => {
    listeners.onUpdateAvailable?.({ version: '6.113.0' });
    await flushListeners();
    vi.setSystemTime(announcedAt + 10 * minuteMs);
    listeners.onUpdateAvailable?.({ version: '6.113.1' });
    await flushListeners();

    vi.setSystemTime(announcedAt + 30 * minuteMs);
    listeners.onInstalled?.({ reason: 'update' });
    await flushListeners();

    expect(mocks.queueAnalyticsRequest).toHaveBeenCalledWith('extension_update_applied', {
      msSinceAvailable: 30 * minuteMs,
      appliedVia: 'automatic',
    });
  });

  test('reports nothing when the update was never announced', async () => {
    listeners.onInstalled?.({ reason: 'update' });
    await flushListeners();

    expect(mocks.queueAnalyticsRequest).not.toHaveBeenCalled();
  });

  test('reports each update only once', async () => {
    listeners.onUpdateAvailable?.({ version: '6.113.0' });
    await flushListeners();
    listeners.onInstalled?.({ reason: 'update' });
    await flushListeners();
    listeners.onInstalled?.({ reason: 'update' });
    await flushListeners();

    expect(mocks.queueAnalyticsRequest).toHaveBeenCalledTimes(1);
  });

  test('ignores fresh installs', async () => {
    listeners.onUpdateAvailable?.({ version: '6.113.0' });
    await flushListeners();
    listeners.onInstalled?.({ reason: 'install' });
    await flushListeners();

    expect(mocks.queueAnalyticsRequest).not.toHaveBeenCalled();
  });
});
