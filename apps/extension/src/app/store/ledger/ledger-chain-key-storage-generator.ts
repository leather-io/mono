import { PayloadAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { resetWallet } from '@leather.io/state';
import { fingerprintMigration, userRemovesWallet } from '@leather.io/state/wallet';

import { assumedZeroFingerprint } from '@shared/utils';

interface RequiredProps {
  id: string;
  fingerprint: string;
}
export function generateLedgerChainKeyStorageSlice<KeyDetails extends RequiredProps>(name: string) {
  const adapter = createEntityAdapter<KeyDetails>();

  const initialState = adapter.getInitialState();

  const slice = createSlice({
    name: name + 'Keys',
    initialState,
    reducers: {
      addKeys(state, { payload }: PayloadAction<KeyDetails[]>) {
        adapter.addMany(state, payload);
      },
    },
    extraReducers: builder =>
      builder
        .addCase(resetWallet, state => adapter.removeAll(state))
        .addCase(fingerprintMigration, (state, action) => {
          const newFingerprint = action.payload;

          // Collect entities to migrate
          const entitiesToMigrate: KeyDetails[] = [];
          const idsToRemove: string[] = [];

          const entities = state.entities as Record<string, KeyDetails | undefined>;

          state.ids.forEach(id => {
            const entityId = String(id);
            const entity = entities[entityId];
            if (entity && entity.fingerprint === assumedZeroFingerprint) {
              // Update the entity with new fingerprint and new ID
              const newId = entityId.replace(assumedZeroFingerprint, newFingerprint);
              entitiesToMigrate.push({
                ...entity,
                id: newId,
                fingerprint: newFingerprint,
              } as KeyDetails);
              idsToRemove.push(entityId);
            }
          });

          adapter.removeMany(state, idsToRemove);
          adapter.addMany(state, entitiesToMigrate);
        })
        .addCase(userRemovesWallet, (state, action) => {
          const { fingerprint } = action.payload;

          // Find all entity IDs that match the fingerprint
          const idsToRemove: string[] = [];

          const entities = state.entities as Record<string, KeyDetails | undefined>;

          state.ids.forEach(id => {
            const entity = entities[id];
            if (entity && entity.fingerprint === fingerprint) idsToRemove.push(id);
          });

          // Remove all matching entities
          adapter.removeMany(state, idsToRemove);
        }),
  });

  return { slice, initialState, adapter };
}
