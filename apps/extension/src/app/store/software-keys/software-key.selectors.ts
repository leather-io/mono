import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import { initBigNumber } from '@leather.io/utils';

import { assumedZeroFingerprint } from '@shared/utils';

import { initialSearchParams } from '@app/common/initial-search-params';
import { RootState } from '@app/store';

import { selectActiveAccount } from '../active/active.selectors';
import { selectHasSwitched } from '../ui/ui.selectors';
import { keyAdapter } from './software-key.slice';

function selectKeysSlice(state: RootState) {
  return state.softwareKeys;
}

export const selectCurrentAccount = createSelector(
  selectActiveAccount,
  selectHasSwitched,
  (activeAccount, hasSwitched) => {
    const customAccountIndex = hasSwitched ? null : initialSearchParams.get('accountIndex');
    const customFingerprint = hasSwitched ? null : initialSearchParams.get('fingerprint');

    const accountIndex =
      customAccountIndex && initBigNumber(customAccountIndex).isInteger()
        ? initBigNumber(customAccountIndex).toNumber()
        : (activeAccount?.accountIndex ?? 0);

    const fingerprint = customFingerprint ?? activeAccount?.fingerprint ?? assumedZeroFingerprint;

    return {
      fingerprint,
      accountIndex,
    };
  }
);

const selectActiveSoftwareKey = createSelector(
  selectKeysSlice,
  selectCurrentAccount,
  (keysState, currentAccount) => keysState.entities[currentAccount.fingerprint]
);

export const selectWalletSalt = createSelector(selectKeysSlice, state => state.salt);

export function useActiveSoftwareKey() {
  return useSelector(selectActiveSoftwareKey);
}

const selectors = keyAdapter.getSelectors<RootState>(selectKeysSlice);

export const selectSoftwareKeys = selectors.selectAll;
