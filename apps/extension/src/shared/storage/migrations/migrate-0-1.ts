import { type PersistConfig, getStoredState } from 'redux-persist';

import { analytics } from '@shared/utils/analytics';

import type { RootState } from '@app/store';

import { storage } from '../storage-driver';

// Previously we used redux-persist's serialization feature. As `chrome.storage`
// doesn't require data to be serialized, we can disable that feature, however
// it requires a migration.
// Disabling it has a few benefits:
// - We rely less on redux-persist's implementation details, such as to parse the store
// - We can more easily read store data in the background script
// - We can more easily declare default wallet state for use in tests
const legacyPersistConfig: PersistConfig<RootState> = {
  key: 'root',
  version: 1,
  storage,
  serialize: true,
  whitelist: ['analytics', 'chains', 'keys', 'networks', 'onboarding', 'settings'],
};

export async function migrateToUsingNoSerialization() {
  const storageVal = (await new Promise(resolve =>
    chrome.storage.local.get(['persist:root'], resolve)
  )) as any;

  if (!storageVal) return undefined;

  const store = storageVal['persist:root'];

  if (typeof store === 'string') {
    debugger;
    console.log('LOGGING EVENT TAHT SHOULD ONLY RUN ONCE');
    void analytics.track('redux_persist_migration_to_no_serialization');
    return getStoredState(legacyPersistConfig);
  }

  return storage;
}
