import { isDeepEqual, isPlainObject, pick } from 'remeda';

import {
  type DirtySliceSnapshot,
  type DirtySliceTracker,
  persistDirtyTracker,
} from './dirty-slice-tracker';
import { persistWhitelist } from './persist-whitelist';
import { storage } from './storage-driver';

const persistRootWriteLockName = 'leather:persist-root-write';

// Serializes read-merge-write across every extension context (frames share the
// extension origin) and across overlapping persistoid writes within a frame
async function withPersistRootWriteLock<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && 'locks' in navigator) {
    return navigator.locks.request(persistRootWriteLockName, fn);
  }
  return fn();
}

export function getPersistVersion(root: Record<string, unknown>) {
  const persistMeta = root._persist;
  if (!isPlainObject(persistMeta)) return undefined;
  return typeof persistMeta.version === 'number' ? persistMeta.version : undefined;
}

function buildMergedRoot(
  stored: Record<string, unknown>,
  staged: Record<string, unknown>,
  snapshot: DirtySliceSnapshot
) {
  const merged: Record<string, unknown> = { ...pick(stored, persistWhitelist) };
  for (const key of persistWhitelist) {
    if (!(key in merged) && key in staged) merged[key] = staged[key];
  }
  for (const key of snapshot.keys()) {
    if (key in staged) merged[key] = staged[key];
  }
  merged._persist = staged._persist;
  return merged;
}

// redux-persist's persistoid stages every whitelisted slice at boot and
// rewrites all of them on each write, so a frame holding stale slices would
// clobber slices other frames changed since it booted. This driver only lets a
// frame overwrite slices it actually changed (dirty); everything else keeps
// the stored value
/** @knipignore */
export function createMergePersistStorage(tracker: DirtySliceTracker) {
  return {
    getItem(key: string) {
      return storage.getItem(key);
    },
    removeItem(key: string) {
      return storage.removeItem(key);
    },
    async setItem(key: string, staged: unknown): Promise<void> {
      if (tracker.areWritesSuspended()) return;
      if (!isPlainObject(staged)) {
        await storage.setItem(key, staged);
        return;
      }
      return withPersistRootWriteLock(async () => {
        const snapshot = tracker.snapshot();
        const stored = await storage.getItem(key);

        // A missing record (fresh install, post-sign-out) or a version change
        // (the migrated tree exists only in memory) must be written wholesale;
        // merging old-shape stored slices under a new version number would
        // stamp the new version onto unmigrated data
        const requiresFullWrite =
          !isPlainObject(stored) || getPersistVersion(staged) !== getPersistVersion(stored);

        if (requiresFullWrite) {
          await storage.setItem(key, staged);
          tracker.clearIfUnchanged(snapshot);
          return;
        }

        const merged = buildMergedRoot(stored, staged, snapshot);
        if (!isDeepEqual(merged, stored)) await storage.setItem(key, merged);
        tracker.clearIfUnchanged(snapshot);
      });
    },
  };
}

export const mergePersistStorage = createMergePersistStorage(persistDirtyTracker);
