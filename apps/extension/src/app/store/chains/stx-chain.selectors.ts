import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '@app/store';

import { getCurrentWalletKeyFromChain } from '../accounts/blockchain/stacks/stacks-account.selectors';

export function selectStacksChain(state: RootState) {
  return state.chains.stx;
}

export const selectHighestAccountIndex = createSelector(selectStacksChain, chainState => {
  const currentKey = getCurrentWalletKeyFromChain(chainState);
  return chainState[currentKey]?.highestAccountIndex ?? 0;
});
