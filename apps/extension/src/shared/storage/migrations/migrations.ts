import { type PersistMigrate, createMigrate } from 'redux-persist';

import { logger } from '@shared/logger';
import { analytics } from '@shared/utils/analytics';

import { migrateToUsingNoSerialization } from './migrate-0-1';
import { migrateToRenameKeysStoreModule } from './migrate-1-2';
import { migrateMultiWalletSupport } from './migrate-2-3';
import { migrateToAccountsSlice } from './migrate-3-4';

function trackMigrationStart(event: string) {
  try {
    analytics.untypedTrack(event);
  } catch (e) {
    logger.warn('Migration analytics tracking failed', e);
  }
}

interface AsyncMigrationManifest {
  [version: number]: (state: Promise<unknown>) => Promise<unknown>;
  debug: boolean;
}

interface MigrateFactory {
  createMigrate(manifest: object): PersistMigrate;
}

const migrateFactory: MigrateFactory = { createMigrate };

function createAsyncMigrate(manifest: AsyncMigrationManifest) {
  return migrateFactory.createMigrate(manifest);
}

export const migrations = createAsyncMigrate({
  async 0() {
    trackMigrationStart('migration_0_1_using_no_serialization_started');
    return migrateToUsingNoSerialization();
  },
  async 2(state: Promise<unknown>) {
    trackMigrationStart('migration_1_2_rename_keys_store_module_started');
    return migrateToRenameKeysStoreModule(await state);
  },
  async 3(state: Promise<unknown>) {
    trackMigrationStart('migration_2_3_multi_wallet_support_started');
    return migrateMultiWalletSupport(await state);
  },
  async 4(state: Promise<unknown>) {
    trackMigrationStart('migration_3_4_accounts_slice_started');
    return migrateToAccountsSlice(await state);
  },
  debug: true,
});
