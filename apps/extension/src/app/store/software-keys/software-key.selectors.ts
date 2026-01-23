import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import { initBigNumber } from '@leather.io/utils';

import { assumedZeroFingerprint } from '@shared/utils';

import { initialSearchParams } from '@app/common/initial-search-params';
import { RootState } from '@app/store';

import { selectActiveAccount } from '../active/active.selectors';
import { keyAdapter } from './software-key.slice';

function selectKeysSlice(state: RootState) {
  return state.softwareKeys;
}

const selectActiveSoftwareKey = createSelector(
  selectKeysSlice,
  selectActiveAccount,
  (keysState, activeAccount) => {
    if (!activeAccount) return undefined;
    return keysState.entities[activeAccount.fingerprint];
  }
);

export const selectWalletSalt = createSelector(
  selectKeysSlice,
  // State v3 migrates salt to softwareKeys root
  state =>
    state.salt ?? ((state.entities[assumedZeroFingerprint] as any)?.salt as string | undefined)
);

export function useActiveSoftwareKey() {
  return useSelector(selectActiveSoftwareKey);
}

export const selectCurrentAccount = createSelector(selectActiveAccount, activeAccount => {
  const customAccountIndex = initialSearchParams.get('accountIndex');
  const accountIndex =
    customAccountIndex && initBigNumber(customAccountIndex).isInteger()
      ? initBigNumber(customAccountIndex).toNumber()
      : (activeAccount?.accountIndex ?? 0);

  return {
    fingerprint: activeAccount?.fingerprint ?? assumedZeroFingerprint,
    accountIndex,
  };
});

const selectors = keyAdapter.getSelectors<RootState>(selectKeysSlice);

export const selectSoftwareKeys = selectors.selectAll;
