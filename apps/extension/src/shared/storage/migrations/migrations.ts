import { createMigrate } from 'redux-persist';

import { migrateToUsingNoSerialization } from './migrate-0-1';
import { migrateToRenameKeysStoreModule } from './migrate-1-2';
import { migrateMultiWalletSupport } from './migrate-2-3';

export const migrations = createMigrate({
  0: async () => {
    return migrateToUsingNoSerialization();
  },
  2: (state: any) => {
    return migrateToRenameKeysStoreModule(state);
  },
  3: (state: any) => {
    return migrateMultiWalletSupport(state);
  },
  debug: true,
} as any);
