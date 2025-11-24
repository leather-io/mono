import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '@app/store';

export function selectStacksChain(state: RootState) {
  return state.chains.stx;
}

export const selectHighestAccountIndex = createSelector(
  selectStacksChain,
  state => state.default.highestAccountIndex
);
