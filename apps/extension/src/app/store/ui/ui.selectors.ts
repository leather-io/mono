import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '..';

function selectUi(state: RootState) {
  return state.ui;
}

export const selectLoadingState = createSelector(selectUi, state => state.loadingState);

export const selectHasSwitched = createSelector(selectUi, state => state.hasSwitched);
