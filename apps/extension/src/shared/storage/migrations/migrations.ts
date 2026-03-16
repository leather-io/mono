import { createMigrate } from 'redux-persist';

import { analytics } from '@shared/utils/analytics';

import { migrateToUsingNoSerialization } from './migrate-0-1';
import { migrateToRenameKeysStoreModule } from './migrate-1-2';
import { migrateMultiWalletSupport } from './migrate-2-3';

export const migrations = createMigrate({
  0: async () => {
    analytics.untypedTrack('migration_0_1_using_no_serialization_started');
    return migrateToUsingNoSerialization();
  },
  2: async (state: Promise<any>) => {
    analytics.untypedTrack('migration_1_2_rename_keys_store_module_started');
    return migrateToRenameKeysStoreModule(await state);
  },
  3: async (state: Promise<any>) => {
    analytics.untypedTrack('migration_2_3_multi_wallet_support_started');
    return migrateMultiWalletSupport(await state);
  },
  debug: true,
} as any);
