import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '@app/store';

function selectActive(state: RootState) {
  return state.active;
}

export const selectActiveAccount = createSelector(selectActive, state => state.account);

export const selectActivePolicyId = createSelector(selectActive, state => state.activePolicyId);
