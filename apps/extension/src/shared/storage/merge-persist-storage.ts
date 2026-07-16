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
export async function withPersistRootWriteLock<T>(fn: () => Promise<T>): Promise<T> {
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
  snapshot: DirtySliceSnapshot,
  observedRootKeys?: ReadonlySet<string>
) {
  const merged: Record<string, unknown> = { ...pick(stored, persistWhitelist) };
  for (const key of persistWhitelist) {
    // Seeding a staged slice missing from storage covers newly whitelisted
    // slices, but a slice the observed root once had went missing because
    // sign-out erased it, and must not be restored from this frame's stage
    if (key in merged || !(key in staged)) continue;
    if (observedRootKeys?.has(key)) continue;
    merged[key] = staged[key];
  }
  for (const key of snapshot.keys()) {
    if (key in staged) merged[key] = staged[key];
  }
  merged._persist = staged._persist;
  return merged;
}

function buildDirtyOnlyRoot(staged: Record<string, unknown>, snapshot: DirtySliceSnapshot) {
  const dirtyOnly: Record<string, unknown> = {};
  for (const key of snapshot.keys()) {
    if (key in staged) dirtyOnly[key] = staged[key];
  }
  dirtyOnly._persist = staged._persist;
  return dirtyOnly;
}

// redux-persist's persistoid stages every whitelisted slice at boot and
// rewrites all of them on each write, so a frame holding stale slices would
// clobber slices other frames changed since it booted. This driver only lets a
// frame overwrite slices it actually changed (dirty); everything else keeps
// the stored value
/** @knipignore */
export function createMergePersistStorage(tracker: DirtySliceTracker) {
  let observedRootKeys: ReadonlySet<string> | undefined;

  function observeStoredRoot(stored: unknown) {
    if (observedRootKeys === undefined && isPlainObject(stored)) {
      observedRootKeys = new Set(Object.keys(stored));
    }
    return stored;
  }

  return {
    async getItem(key: string) {
      return observeStoredRoot(await storage.getItem(key));
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
        if (tracker.areWritesSuspended()) return;
        const snapshot = tracker.snapshot();
        const stored = observeStoredRoot(await storage.getItem(key));

        if (!isPlainObject(stored)) {
          // A record missing on first observation is a fresh install and must
          // be written wholesale. A record that disappears after this context
          // saw one was purged by sign-out in some frame; writing the staged
          // tree wholesale would restore wallet keys another frame just
          // erased, so only slices this frame itself changed may be written
          if (observedRootKeys !== undefined) {
            if (snapshot.size === 0) return;
            await storage.setItem(key, buildDirtyOnlyRoot(staged, snapshot));
            tracker.clearIfUnchanged(snapshot);
            return;
          }
          await storage.setItem(key, staged);
          observedRootKeys = new Set(Object.keys(staged));
          tracker.clearIfUnchanged(snapshot);
          return;
        }

        // A version change (the migrated tree exists only in memory) must be
        // written wholesale; merging old-shape stored slices under a new
        // version number would stamp the new version onto unmigrated data
        if (getPersistVersion(staged) !== getPersistVersion(stored)) {
          await storage.setItem(key, staged);
          tracker.clearIfUnchanged(snapshot);
          return;
        }

        const merged = buildMergedRoot(stored, staged, snapshot, observedRootKeys);
        if (!isDeepEqual(merged, stored)) await storage.setItem(key, merged);
        tracker.clearIfUnchanged(snapshot);
      });
    },
  };
}

export const mergePersistStorage = createMergePersistStorage(persistDirtyTracker);
