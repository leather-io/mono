import { useSyncExternalStore } from 'react';

import * as inMemoryStore from './in-memory-storage';

export function useInMemoryKeys() {
  const version = useSyncExternalStore(inMemoryStore.subscribe, inMemoryStore.getSnapshot);
  return { getKey: inMemoryStore.getKey, hasKey: inMemoryStore.hasKey, version };
}
