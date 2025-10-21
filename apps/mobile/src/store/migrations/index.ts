import { MigrationManifest } from 'redux-persist';

import { migrateFlattenKeychains } from './migrate-0-1-flatten-keychains';

export const migrations: MigrationManifest = {
  // 0 -> 1:
  // Flatten keychains state from separate chains into single keychains entity
  1: state => migrateFlattenKeychains(state),
};
