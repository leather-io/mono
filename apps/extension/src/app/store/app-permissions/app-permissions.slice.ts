import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { fingerprintMigration, userRemovesWallet } from '@leather.io/state/wallet';

import type { AppPermission } from '@shared/permissions/permission.helpers';
import { assumedZeroFingerprint } from '@shared/utils';

import { userRemovesPolicy } from '../policy/policy.slice';

export const appPermissionsAdapter = createEntityAdapter<AppPermission, string>({
  selectId: permission => permission.origin,
});

const initialState = appPermissionsAdapter.getInitialState();

export const appPermissionsSlice = createSlice({
  name: 'appPermissions',
  initialState,
  reducers: { updatePermission: appPermissionsAdapter.setOne },
  extraReducers: builder =>
    builder
      .addCase(userRemovesWallet, (state, action) => {
        const origins = state.ids.filter(
          origin => state.entities[origin]?.fingerprint === action.payload.fingerprint
        );
        appPermissionsAdapter.removeMany(state, origins);
      })

      .addCase(userRemovesPolicy, (state, action) => {
        const updates = state.ids
          .filter(origin => state.entities[origin]?.policyId === action.payload.policyId)
          .map(origin => ({ id: origin, changes: { policyId: undefined } }));
        appPermissionsAdapter.updateMany(state, updates);
      })

      .addCase(fingerprintMigration, (state, action) => {
        const newFingerprint = action.payload;
        const updates = state.ids
          .filter(origin => state.entities[origin]?.fingerprint === assumedZeroFingerprint)
          .map(origin => ({ id: origin, changes: { fingerprint: newFingerprint } }));
        appPermissionsAdapter.updateMany(state, updates);
      }),
});
