import { MigrationManifest } from 'redux-persist';

import { migrateFlattenKeychains } from './migrate-0-1-flatten-keychains';
import { migratePadFingerprints } from './migrate-1-2-pad-fingerprints';

export const migrations: MigrationManifest = {
  // 0 -> 1:
  // Flatten keychains state from separate chains into single keychains entity
  1: state => migrateFlattenKeychains(state),
  // 1 -> 2:
  // Pad fingerprints with leading zeros to ensure 8-character hex strings
  2: state => migratePadFingerprints(state) as any,
};
