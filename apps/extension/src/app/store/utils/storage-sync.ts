import { createAction } from '@reduxjs/toolkit';
import { isDeepEqual, isPlainObject } from 'remeda';

import type { DirtySliceTracker } from '@shared/storage/dirty-slice-tracker';
import { getPersistVersion } from '@shared/storage/merge-persist-storage';
import { type PersistedSliceKey, persistWhitelist } from '@shared/storage/persist-whitelist';

import type { LocalRootState } from '@app/store';

const persistRootStorageKey = 'persist:root';

type HydratedSlices = Partial<Pick<LocalRootState, PersistedSliceKey>>;

// Handled at rootReducer level: replaces whole slice subtrees with the values
// another frame persisted to chrome.storage.local
export const hydrateSlicesFromStorage = createAction<HydratedSlices>(
  'storageSync/hydrateSlicesFromStorage'
);

interface SyncStoreState extends Partial<Record<PersistedSliceKey, unknown>> {
  _persist?: { rehydrated: boolean; version: number };
}

interface SyncStore {
  getState(): SyncStoreState;
  dispatch(action: ReturnType<typeof hydrateSlicesFromStorage>): unknown;
  subscribe(listener: () => void): () => void;
}

function hasRehydrated(store: SyncStore) {
  return store.getState()._persist?.rehydrated === true;
}

// Storage holds whatever this extension version last persisted; trusting its
// slice shapes mirrors what redux-persist's own rehydration already does
function isHydratedSlices(
  slices: Partial<Record<PersistedSliceKey, unknown>>
): slices is HydratedSlices {
  return Object.values(slices).every(isPlainObject);
}

type InitialSlices = Partial<Record<PersistedSliceKey, unknown>>;

// Stored slices can predate fields later added to a slice's initial state;
// redux-persist's autoMergeLevel2 injects those defaults at rehydrate, so a
// raw stored slice applied verbatim would strip them again. Merging under the
// initial state (not current state) keeps sync equivalent to a fresh
// rehydrate and lets a remotely removed optional field fall back to default
function mergeUnderInitialState(initialSlice: unknown, incoming: unknown) {
  if (!isPlainObject(initialSlice) || !isPlainObject(incoming)) return incoming;
  return { ...initialSlice, ...incoming };
}

function applyRemoteRoot(
  store: SyncStore,
  tracker: DirtySliceTracker,
  initialSlices: InitialSlices,
  root: unknown
) {
  if (!isPlainObject(root)) return;
  const state = store.getState();
  if (getPersistVersion(root) !== state._persist?.version) return;
  const changedSlices: Partial<Record<PersistedSliceKey, unknown>> = {};
  let hasChanges = false;
  for (const key of persistWhitelist) {
    if (!(key in root)) continue;
    if (tracker.isDirty(key)) continue;
    const incoming = mergeUnderInitialState(initialSlices[key], root[key]);
    if (isDeepEqual(incoming, state[key])) continue;
    changedSlices[key] = incoming;
    hasChanges = true;
  }
  if (!hasChanges || !isHydratedSlices(changedSlices)) return;
  store.dispatch(hydrateSlicesFromStorage(changedSlices));
}

async function reconcileWithStorage(
  store: SyncStore,
  tracker: DirtySliceTracker,
  initialSlices: InitialSlices
) {
  const stored = await chrome.storage.local.get(persistRootStorageKey);
  if (tracker.areWritesSuspended()) return;
  applyRemoteRoot(store, tracker, initialSlices, stored[persistRootStorageKey]);
}

// Keeps this frame's store in sync with slices other frames persist. Every
// extension context (popup, full-page tabs, request windows) runs its own
// store; without this, a frame only ever sees the state it rehydrated at boot
export function initCrossFrameStorageSync(
  store: SyncStore,
  tracker: DirtySliceTracker,
  initialSlices: InitialSlices
) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return;
    const change = changes[persistRootStorageKey];
    if (!change) return;
    if (tracker.areWritesSuspended()) return;
    if (!hasRehydrated(store)) return;
    applyRemoteRoot(store, tracker, initialSlices, change.newValue);
  });

  // Writes landing between redux-persist's initial storage read and this
  // listener becoming live would otherwise be missed; reconcile once rehydrated
  const unsubscribe = store.subscribe(() => {
    if (!hasRehydrated(store)) return;
    unsubscribe();
    void reconcileWithStorage(store, tracker, initialSlices);
  });
}
