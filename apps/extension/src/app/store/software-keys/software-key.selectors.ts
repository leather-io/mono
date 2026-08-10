import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import { initBigNumber } from '@leather.io/utils';

import { isPlatformUnlockConfig } from '@shared/crypto/platform-unlock';
import { assumedZeroFingerprint } from '@shared/utils';

import { initialSearchParams } from '@app/common/initial-search-params';
import { RootState } from '@app/store';

import { selectActiveAccount } from '../active/active.selectors';
import { selectHasSwitched } from '../ui/ui.selectors';
import { selectWalletEntities } from '../wallets/wallet.selectors';
import { type WalletAuthenticationMode, keyAdapter } from './software-key.slice';

interface PersistedWalletAuthenticationState {
  authenticationMode?: unknown;
  ids: readonly string[];
  platformUnlock?: unknown;
  salt?: unknown;
}

interface WalletAuthenticationCapabilities {
  authenticationMode: WalletAuthenticationMode | null;
  biometrics: boolean;
  password: boolean;
  valid: boolean;
}

function selectKeysSlice(state: RootState) {
  return state.softwareKeys;
}

function selectPersistedWalletAuthenticationState(
  state: RootState
): PersistedWalletAuthenticationState {
  return state.softwareKeys;
}

function getWalletAuthenticationCapabilities({
  authenticationMode,
  ids,
  platformUnlock,
  salt,
}: PersistedWalletAuthenticationState): WalletAuthenticationCapabilities {
  const hasSoftwareKeys = ids.length > 0;
  const hasSalt = typeof salt === 'string' && salt.length > 0;
  const hasPlatformUnlock = platformUnlock !== undefined;
  const validPlatformUnlock = isPlatformUnlockConfig(platformUnlock);

  if (!hasSoftwareKeys) {
    const valid = authenticationMode === undefined && !hasPlatformUnlock && salt === undefined;
    return {
      authenticationMode: valid ? 'password' : null,
      biometrics: false,
      password: false,
      valid,
    };
  }

  if (authenticationMode === undefined) {
    const valid = !hasPlatformUnlock && (salt === undefined || hasSalt);
    return {
      authenticationMode: valid ? 'password' : null,
      biometrics: false,
      password: valid,
      valid,
    };
  }

  if (authenticationMode === 'password') {
    const valid = hasSalt && !hasPlatformUnlock;
    return {
      authenticationMode: valid ? 'password' : null,
      biometrics: false,
      password: valid,
      valid,
    };
  }

  if (authenticationMode === 'biometric-only') {
    const valid = !hasSalt && validPlatformUnlock;
    return {
      authenticationMode: valid ? 'biometric-only' : null,
      biometrics: valid,
      password: false,
      valid,
    };
  }

  return { authenticationMode: null, biometrics: false, password: false, valid: false };
}

export const selectWalletAuthenticationCapabilities = createSelector(
  selectPersistedWalletAuthenticationState,
  getWalletAuthenticationCapabilities
);

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

export function useActiveSoftwareKey() {
  return useSelector(selectActiveSoftwareKey);
}

const selectors = keyAdapter.getSelectors<RootState>(selectKeysSlice);

export const selectSoftwareKeys = selectors.selectAll;
