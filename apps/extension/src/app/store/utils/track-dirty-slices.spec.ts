import { type UnknownAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import { describe, expect, test } from 'vitest';

import { createDirtySliceTracker } from '@shared/storage/dirty-slice-tracker';
import type { PersistedSliceKey } from '@shared/storage/persist-whitelist';

import { hydrateSlicesFromStorage } from './storage-sync';
import { createTrackDirtySlicesMiddleware } from './track-dirty-slices';

type HarnessState = Record<PersistedSliceKey, unknown>;

function createHarness() {
  const tracker = createDirtySliceTracker();
  const middleware = createTrackDirtySlicesMiddleware(tracker);

  let state: HarnessState = {
    accounts: { ids: [] },
    policy: { ids: [] },
    active: {},
    chains: { stx: {} },
    softwareKeys: { ids: [] },
    appPermissions: { ids: [] },
    networks: { ids: [] },
    settings: {},
    wallets: { ids: [] },
    keychains: { ids: [] },
    manageTokens: { ids: [] },
  };

  const storeApi = {
    getState() {
      return state;
    },
    dispatch<T extends UnknownAction>(action: T) {
      return action;
    },
  };

  function dispatchWithStateChange(action: UnknownAction, nextState: HarnessState) {
    return middleware(storeApi)(() => {
      state = nextState;
      return action;
    })(action);
  }

  return { tracker, getState: () => state, dispatchWithStateChange };
}

describe(createTrackDirtySlicesMiddleware.name, () => {
  test('marks slices whose reference changed during dispatch', () => {
    const { tracker, getState, dispatchWithStateChange } = createHarness();
    dispatchWithStateChange(
      { type: 'networks/addNetwork' },
      { ...getState(), networks: { ids: ['devnet'] } }
    );
    expect(tracker.isDirty('networks')).toBe(true);
    expect(tracker.isDirty('settings')).toBe(false);
  });

  test('does not mark slices when references are unchanged', () => {
    const { tracker, getState, dispatchWithStateChange } = createHarness();
    dispatchWithStateChange({ type: 'some/action' }, getState());
    expect(tracker.getDirtyKeys()).toEqual([]);
  });

  test('skips rehydration', () => {
    const { tracker, getState, dispatchWithStateChange } = createHarness();
    dispatchWithStateChange({ type: REHYDRATE }, { ...getState(), networks: { ids: ['devnet'] } });
    expect(tracker.getDirtyKeys()).toEqual([]);
  });

  test('skips cross-frame slice hydration', () => {
    const { tracker, getState, dispatchWithStateChange } = createHarness();
    dispatchWithStateChange(hydrateSlicesFromStorage({}), {
      ...getState(),
      networks: { ids: ['devnet'] },
    });
    expect(tracker.getDirtyKeys()).toEqual([]);
  });

  test('marks every changed slice on reset-style actions', () => {
    const { tracker, getState, dispatchWithStateChange } = createHarness();
    dispatchWithStateChange(
      { type: 'global/resetWallet' },
      { ...getState(), networks: { ids: [] }, settings: {}, wallets: { ids: [] } }
    );
    expect(tracker.isDirty('networks')).toBe(true);
    expect(tracker.isDirty('settings')).toBe(true);
    expect(tracker.isDirty('wallets')).toBe(true);
  });
});
