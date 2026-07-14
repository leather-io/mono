import { describe, expect, test, vi } from 'vitest';

import { createDirtySliceTracker } from './dirty-slice-tracker';
import { createMergePersistStorage } from './merge-persist-storage';

const persistRootKey = 'persist:root';

interface SeedRootArgs {
  version?: number;
  slices: Record<string, unknown>;
}

function makeRoot({ version = 4, slices }: SeedRootArgs) {
  return { ...slices, _persist: { version, rehydrated: true } };
}

async function seedStorage(root: Record<string, unknown>) {
  await chrome.storage.local.set({ [persistRootKey]: root });
}

async function readStorage() {
  const stored = await chrome.storage.local.get(persistRootKey);
  return stored[persistRootKey];
}

function setup() {
  const tracker = createDirtySliceTracker();
  const driver = createMergePersistStorage(tracker);
  return { tracker, driver };
}

describe(createMergePersistStorage.name, () => {
  test('only dirty slices overwrite stored values', async () => {
    const { tracker, driver } = setup();
    await seedStorage(
      makeRoot({ slices: { networks: { ids: ['devnet'] }, settings: { theme: 'dark' } } })
    );
    tracker.markDirty('settings');

    await driver.setItem(
      persistRootKey,
      makeRoot({ slices: { networks: { ids: [] }, settings: { theme: 'light' } } })
    );

    expect(await readStorage()).toEqual(
      makeRoot({ slices: { networks: { ids: ['devnet'] }, settings: { theme: 'light' } } })
    );
  });

  test('writes staged root wholesale when nothing is stored', async () => {
    const { driver } = setup();
    const staged = makeRoot({ slices: { networks: { ids: ['devnet'] } } });

    await driver.setItem(persistRootKey, staged);

    expect(await readStorage()).toEqual(staged);
  });

  test('writes staged root wholesale when the persist version changed', async () => {
    const { driver } = setup();
    await seedStorage(makeRoot({ version: 4, slices: { networks: { ids: ['devnet'] } } }));
    const migrated = makeRoot({ version: 5, slices: { networks: { migrated: true } } });

    await driver.setItem(persistRootKey, migrated);

    expect(await readStorage()).toEqual(migrated);
  });

  test('skips the write when the merged root equals the stored root', async () => {
    const { driver } = setup();
    const root = makeRoot({ slices: { networks: { ids: ['devnet'] } } });
    await seedStorage(root);
    const setSpy = vi.spyOn(chrome.storage.local, 'set');

    await driver.setItem(persistRootKey, makeRoot({ slices: { networks: { ids: [] } } }));

    expect(setSpy).not.toHaveBeenCalled();
    expect(await readStorage()).toEqual(root);
    setSpy.mockRestore();
  });

  test('does not write while writes are suspended', async () => {
    const { tracker, driver } = setup();
    const root = makeRoot({ slices: { networks: { ids: ['devnet'] } } });
    await seedStorage(root);
    tracker.markDirty('networks');
    tracker.suspendWrites();

    await driver.setItem(persistRootKey, makeRoot({ slices: { networks: { ids: [] } } }));

    expect(await readStorage()).toEqual(root);
  });

  test('seeds staged slices missing from storage even when clean', async () => {
    const { tracker, driver } = setup();
    await seedStorage(makeRoot({ slices: { networks: { ids: ['devnet'] } } }));
    tracker.markDirty('settings');

    await driver.setItem(
      persistRootKey,
      makeRoot({
        slices: {
          networks: { ids: [] },
          settings: { theme: 'dark' },
          manageTokens: { ids: [] },
        },
      })
    );

    expect(await readStorage()).toEqual(
      makeRoot({
        slices: {
          networks: { ids: ['devnet'] },
          settings: { theme: 'dark' },
          manageTokens: { ids: [] },
        },
      })
    );
  });

  test('drops stored keys that are no longer whitelisted', async () => {
    const { tracker, driver } = setup();
    await seedStorage(
      makeRoot({ slices: { networks: { ids: ['devnet'] }, analytics: { stale: true } } })
    );
    tracker.markDirty('settings');

    await driver.setItem(
      persistRootKey,
      makeRoot({ slices: { networks: { ids: [] }, settings: { theme: 'dark' } } })
    );

    expect(await readStorage()).toEqual(
      makeRoot({ slices: { networks: { ids: ['devnet'] }, settings: { theme: 'dark' } } })
    );
  });

  test('clears dirty flags once the write has landed', async () => {
    const { tracker, driver } = setup();
    await seedStorage(makeRoot({ slices: { settings: { theme: 'dark' } } }));
    tracker.markDirty('settings');

    await driver.setItem(persistRootKey, makeRoot({ slices: { settings: { theme: 'light' } } }));

    expect(tracker.isDirty('settings')).toBe(false);
  });

  test('keeps a slice dirty when it changed again during the write', async () => {
    const { tracker, driver } = setup();
    await seedStorage(makeRoot({ slices: { settings: { theme: 'dark' } } }));
    tracker.markDirty('settings');
    const getSpy = vi.spyOn(chrome.storage.local, 'get').mockImplementation((keys, callback) => {
      tracker.markDirty('settings');
      getSpy.mockRestore();
      return chrome.storage.local.get(keys, callback);
    });

    await driver.setItem(persistRootKey, makeRoot({ slices: { settings: { theme: 'light' } } }));

    expect(tracker.isDirty('settings')).toBe(true);
  });
});
