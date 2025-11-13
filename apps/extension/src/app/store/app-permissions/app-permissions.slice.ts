import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import type { AppPermission } from '@shared/permissions/permission.helpers';
import { getHostnameFromUrl } from '@shared/utils/urls';

import { useCurrentNetwork } from '../networks/networks.selectors';
import { selectCurrentAccount } from '../software-keys/software-key.selectors';

const appPermissionsAdapter = createEntityAdapter<AppPermission, string>({
  selectId: permission => permission.origin,
});

const initialState = appPermissionsAdapter.getInitialState();

export const appPermissionsSlice = createSlice({
  name: 'appPermissions',
  initialState,
  reducers: { updatePermission: appPermissionsAdapter.upsertOne },
});

export function useAppPermissions() {
  const dispatch = useDispatch();
  const currentAccount = useSelector(selectCurrentAccount);
  const currentNetwork = useCurrentNetwork();

  return useMemo(
    () => ({
      hasRequestedAccounts(origin: string) {
        const url = getHostnameFromUrl(origin);
        dispatch(
          appPermissionsSlice.actions.updatePermission({
            origin: url,
            requestedAccounts: new Date().toISOString(),
            fingerprint: currentAccount.fingerprint,
            accountIndex: currentAccount.accountIndex,
            networkMode: currentNetwork.chain.bitcoin.mode,
          })
        );
      },
    }),
    [currentAccount.fingerprint, currentAccount.accountIndex, currentNetwork.chain.bitcoin.mode, dispatch]
  );
}
