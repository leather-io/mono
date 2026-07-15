import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import { initBigNumber } from '@leather.io/utils';

import { assumedZeroFingerprint } from '@shared/utils';

import { initialSearchParams } from '@app/common/initial-search-params';
import { RootState } from '@app/store';

import { selectActiveAccount } from '../active/active.selectors';
import { selectHasSwitched } from '../ui/ui.selectors';
import { selectWalletEntities } from '../wallets/wallet.selectors';
import { keyAdapter } from './software-key.slice';

function selectKeysSlice(state: RootState) {
  return state.softwareKeys;
}

export const selectCurrentAccount = createSelector(
  selectActiveAccount,
  selectHasSwitched,
  selectWalletEntities,
  (activeAccount, hasSwitched, walletEntities) => {
    const fallback = {
      fingerprint: activeAccount?.fingerprint ?? assumedZeroFingerprint,
      accountIndex: activeAccount?.accountIndex ?? 0,
    };

    const ignoreSearchParams = hasSwitched;
    const customAccountIndex = ignoreSearchParams ? null : initialSearchParams.get('accountIndex');
    const customFingerprint = ignoreSearchParams ? null : initialSearchParams.get('fingerprint');

    if (!customFingerprint || !walletEntities[customFingerprint]) return fallback;

    const accountIndex =
      customAccountIndex && initBigNumber(customAccountIndex).isInteger()
        ? initBigNumber(customAccountIndex).toNumber()
        : fallback.accountIndex;

    return { fingerprint: customFingerprint, accountIndex };
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
