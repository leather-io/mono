import { describe, expect, test } from 'vitest';

import { createDirtySliceTracker } from './dirty-slice-tracker';

describe(createDirtySliceTracker.name, () => {
  test('slices are clean until marked dirty', () => {
    const tracker = createDirtySliceTracker();
    expect(tracker.isDirty('networks')).toBe(false);
    tracker.markDirty('networks');
    expect(tracker.isDirty('networks')).toBe(true);
    expect(tracker.getDirtyKeys()).toEqual(['networks']);
  });

  test('clearIfUnchanged clears slices unchanged since the snapshot', () => {
    const tracker = createDirtySliceTracker();
    tracker.markDirty('networks');
    tracker.markDirty('settings');
    const snapshot = tracker.snapshot();
    tracker.clearIfUnchanged(snapshot);
    expect(tracker.isDirty('networks')).toBe(false);
    expect(tracker.isDirty('settings')).toBe(false);
  });

  test('a slice re-dirtied after the snapshot survives clearing', () => {
    const tracker = createDirtySliceTracker();
    tracker.markDirty('networks');
    const snapshot = tracker.snapshot();
    tracker.markDirty('networks');
    tracker.clearIfUnchanged(snapshot);
    expect(tracker.isDirty('networks')).toBe(true);
  });

  test('a slice first dirtied after the snapshot survives clearing', () => {
    const tracker = createDirtySliceTracker();
    const snapshot = tracker.snapshot();
    tracker.markDirty('manageTokens');
    tracker.clearIfUnchanged(snapshot);
    expect(tracker.isDirty('manageTokens')).toBe(true);
  });

  test('writes are not suspended until requested', () => {
    const tracker = createDirtySliceTracker();
    expect(tracker.areWritesSuspended()).toBe(false);
    tracker.suspendWrites();
    expect(tracker.areWritesSuspended()).toBe(true);
  });
});
