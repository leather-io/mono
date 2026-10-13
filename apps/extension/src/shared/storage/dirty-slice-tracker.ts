import type { PersistedSliceKey } from './persist-whitelist';

export type DirtySliceSnapshot = Map<PersistedSliceKey, number>;

export interface DirtySliceTracker {
  markDirty(key: PersistedSliceKey): void;
  isDirty(key: PersistedSliceKey): boolean;
  getDirtyKeys(): PersistedSliceKey[];
  snapshot(): DirtySliceSnapshot;
  clearIfUnchanged(snapshot: DirtySliceSnapshot): void;
  suspendWrites(): void;
  areWritesSuspended(): boolean;
}

/** @knipignore */
export function createDirtySliceTracker(): DirtySliceTracker {
  // Generation counters let a write clear only the dirtiness it observed at
  // snapshot time; a slice re-dirtied while the write was in flight survives
  const generations = new Map<PersistedSliceKey, number>();
  let writesSuspended = false;

  return {
    markDirty(key) {
      generations.set(key, (generations.get(key) ?? 0) + 1);
    },
    isDirty(key) {
      return generations.has(key);
    },
    getDirtyKeys() {
      return [...generations.keys()];
    },
    snapshot() {
      return new Map(generations);
    },
    clearIfUnchanged(snapshot) {
      for (const [key, generation] of snapshot) {
        if (generations.get(key) === generation) generations.delete(key);
      }
    },
    suspendWrites() {
      writesSuspended = true;
    },
    areWritesSuspended() {
      return writesSuspended;
    },
  };
}

export const persistDirtyTracker = createDirtySliceTracker();
