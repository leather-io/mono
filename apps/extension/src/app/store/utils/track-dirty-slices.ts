import { Middleware, isAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

import type { DirtySliceTracker } from '@shared/storage/dirty-slice-tracker';
import { type PersistedSliceKey, persistWhitelist } from '@shared/storage/persist-whitelist';

import { hydrateSlicesFromStorage } from './storage-sync';

type PersistedSlicesState = Partial<Record<PersistedSliceKey, unknown>>;

// Rehydration and cross-frame sync change slice references without this frame
// having authored the data, so they must not mark slices dirty
const untrackedActionTypes = new Set<string>([REHYDRATE, hydrateSlicesFromStorage.type]);

export function createTrackDirtySlicesMiddleware(
  tracker: DirtySliceTracker
): Middleware<Record<string, never>, PersistedSlicesState> {
  return storeApi => next => action => {
    if (isAction(action) && untrackedActionTypes.has(action.type)) return next(action);
    const previousState = storeApi.getState();
    const result = next(action);
    const nextState = storeApi.getState();
    for (const key of persistWhitelist) {
      if (previousState[key] !== nextState[key]) tracker.markDirty(key);
    }
    return result;
  };
}
