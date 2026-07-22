import { describe, expect, test, vi } from 'vitest';

import { createDirtySliceTracker } from '@shared/storage/dirty-slice-tracker';
import type { PersistedSliceKey } from '@shared/storage/persist-whitelist';

import { hydrateSlicesFromStorage, initCrossFrameStorageSync } from './storage-sync';

const persistRootKey = 'persist:root';

interface CreateFakeStoreArgs {
  rehydrated: boolean;
  slices: Partial<Record<PersistedSliceKey, unknown>>;
}

function createFakeStore({ rehydrated, slices }: CreateFakeStoreArgs) {
  let state = { ...slices, _persist: { rehydrated, version: 4 } };
  const listeners = new Set<() => void>();
  const dispatch = vi.fn();
  return {
    getState() {
      return state;
    },
    dispatch,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    markRehydrated() {
      state = { ...state, _persist: { rehydrated: true, version: 4 } };
      for (const listener of [...listeners]) listener();
    },
  };
}

async function drainAsync() {
  await new Promise(resolve => setTimeout(resolve, 0));
  await new Promise(resolve => setTimeout(resolve, 0));
}

function makeRoot(slices: Record<string, unknown>) {
  return { ...slices, _persist: { version: 4, rehydrated: true } };
}

describe(initCrossFrameStorageSync.name, () => {
  test('adopts remote slice changes from storage', async () => {
    const store = createFakeStore({ rehydrated: true, slices: { networks: { ids: [] } } });
    initCrossFrameStorageSync(store, createDirtySliceTracker(), {});

    await chrome.storage.local.set({
      [persistRootKey]: makeRoot({ networks: { ids: ['devnet'] } }),
    });
    await drainAsync();

    expect(store.dispatch).toHaveBeenCalledOnce();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: hydrateSlicesFromStorage.type,
      payload: { networks: { ids: ['devnet'] } },
    });
  });

  test('batches all differing slices into a single dispatch', async () => {
    const store = createFakeStore({
      rehydrated: true,
      slices: { networks: { ids: [] }, settings: { theme: 'dark' } },
    });
    initCrossFrameStorageSync(store, createDirtySliceTracker(), {});

    await chrome.storage.local.set({
      [persistRootKey]: makeRoot({ networks: { ids: ['devnet'] }, settings: { theme: 'light' } }),
    });
    await drainAsync();

    expect(store.dispatch).toHaveBeenCalledOnce();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: hydrateSlicesFromStorage.type,
      payload: {
        networks: { ids: ['devnet'] },
        settings: { theme: 'light' },
      },
    });
  });

  test('skips slices with un-flushed local edits', async () => {
    const store = createFakeStore({
      rehydrated: true,
      slices: { networks: { ids: [] }, settings: { theme: 'dark' } },
    });
    const tracker = createDirtySliceTracker();
    tracker.markDirty('networks');
    initCrossFrameStorageSync(store, tracker, {});

    await chrome.storage.local.set({
      [persistRootKey]: makeRoot({ networks: { ids: ['devnet'] }, settings: { theme: 'light' } }),
    });
    await drainAsync();

    expect(store.dispatch).toHaveBeenCalledWith({
      type: hydrateSlicesFromStorage.type,
      payload: { settings: { theme: 'light' } },
    });
  });

  test('ignores echo events where storage matches local state', async () => {
    const store = createFakeStore({ rehydrated: true, slices: { networks: { ids: ['devnet'] } } });
    initCrossFrameStorageSync(store, createDirtySliceTracker(), {});

    await chrome.storage.local.set({
      [persistRootKey]: makeRoot({ networks: { ids: ['devnet'] } }),
    });
    await drainAsync();

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  test('ignores events until the frame has rehydrated', async () => {
    const store = createFakeStore({ rehydrated: false, slices: { networks: { ids: [] } } });
    initCrossFrameStorageSync(store, createDirtySliceTracker(), {});

    await chrome.storage.local.set({
      [persistRootKey]: makeRoot({ networks: { ids: ['devnet'] } }),
    });
    await drainAsync();

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  test('reconciles against storage once rehydration completes', async () => {
    const store = createFakeStore({ rehydrated: false, slices: { networks: { ids: [] } } });
    initCrossFrameStorageSync(store, createDirtySliceTracker(), {});
    await chrome.storage.local.set({
      [persistRootKey]: makeRoot({ networks: { ids: ['devnet'] } }),
    });
    await drainAsync();
    expect(store.dispatch).not.toHaveBeenCalled();

    store.markRehydrated();
    await drainAsync();

    expect(store.dispatch).toHaveBeenCalledWith({
      type: hydrateSlicesFromStorage.type,
      payload: { networks: { ids: ['devnet'] } },
    });
  });

  test('ignores roots persisted at a different version', async () => {
    const store = createFakeStore({ rehydrated: true, slices: { networks: { ids: [] } } });
    initCrossFrameStorageSync(store, createDirtySliceTracker(), {});

    await chrome.storage.local.set({
      [persistRootKey]: {
        networks: { ids: ['devnet'] },
        _persist: { version: 2, rehydrated: true },
      },
    });
    await drainAsync();

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  test('ignores roots missing persist metadata', async () => {
    const store = createFakeStore({ rehydrated: true, slices: { networks: { ids: [] } } });
    initCrossFrameStorageSync(store, createDirtySliceTracker(), {});

    await chrome.storage.local.set({
      [persistRootKey]: { networks: { ids: ['devnet'] } },
    });
    await drainAsync();

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  test('ignores the record being cleared on sign-out', async () => {
    const store = createFakeStore({ rehydrated: true, slices: { networks: { ids: ['devnet'] } } });
    await chrome.storage.local.set({
      [persistRootKey]: makeRoot({ networks: { ids: ['devnet'] } }),
    });
    initCrossFrameStorageSync(store, createDirtySliceTracker(), {});

    await chrome.storage.local.remove(persistRootKey);
    await drainAsync();

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  test('ignores changes in other storage areas', async () => {
    const store = createFakeStore({ rehydrated: true, slices: { networks: { ids: [] } } });
    initCrossFrameStorageSync(store, createDirtySliceTracker(), {});

    await chrome.storage.session.set({
      [persistRootKey]: makeRoot({ networks: { ids: ['devnet'] } }),
    });
    await drainAsync();

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  test('ignores changes to other storage keys', async () => {
    const store = createFakeStore({ rehydrated: true, slices: { networks: { ids: [] } } });
    initCrossFrameStorageSync(store, createDirtySliceTracker(), {});

    await chrome.storage.local.set({ logs: ['entry'] });
    await drainAsync();

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  test('injects initial-state defaults missing from a stored slice', async () => {
    const store = createFakeStore({
      rehydrated: true,
      slices: { settings: { theme: 'dark', isNotificationsEnabled: true } },
    });
    initCrossFrameStorageSync(store, createDirtySliceTracker(), {
      settings: { theme: 'system', isNotificationsEnabled: true },
    });

    await chrome.storage.local.set({
      [persistRootKey]: makeRoot({ settings: { theme: 'light' } }),
    });
    await drainAsync();

    expect(store.dispatch).toHaveBeenCalledOnce();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: hydrateSlicesFromStorage.type,
      payload: { settings: { theme: 'light', isNotificationsEnabled: true } },
    });
  });

  test('skips slices whose only difference from local state is missing defaults', async () => {
    const store = createFakeStore({
      rehydrated: true,
      slices: { settings: { theme: 'dark', isNotificationsEnabled: true } },
    });
    initCrossFrameStorageSync(store, createDirtySliceTracker(), {
      settings: { theme: 'system', isNotificationsEnabled: true },
    });

    await chrome.storage.local.set({
      [persistRootKey]: makeRoot({ settings: { theme: 'dark' } }),
    });
    await drainAsync();

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  test('stops applying changes once writes are suspended', async () => {
    const store = createFakeStore({ rehydrated: true, slices: { networks: { ids: [] } } });
    const tracker = createDirtySliceTracker();
    tracker.suspendWrites();
    initCrossFrameStorageSync(store, tracker, {});

    await chrome.storage.local.set({
      [persistRootKey]: makeRoot({ networks: { ids: ['devnet'] } }),
    });
    await drainAsync();

    expect(store.dispatch).not.toHaveBeenCalled();
  });
});
