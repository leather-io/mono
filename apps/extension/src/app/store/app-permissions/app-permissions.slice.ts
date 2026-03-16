import { useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import type { AppPermission } from '@shared/permissions/permission.helpers';
import { getHostnameFromUrl } from '@shared/utils/urls';

import { useCurrentAccountId } from '../accounts/account';
import { useCurrentNetwork } from '../networks/networks.selectors';

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
  const account = useCurrentAccountId();
  const currentNetwork = useCurrentNetwork();

  return useMemo(
    () => ({
      hasRequestedAccounts(origin: string) {
        const url = getHostnameFromUrl(origin);
        dispatch(
          appPermissionsSlice.actions.updatePermission({
            ...account,
            origin: url,
            requestedAccounts: new Date().toISOString(),
            networkMode: currentNetwork.chain.bitcoin.mode,
          })
        );
      },
    }),
    [dispatch, account, currentNetwork.chain.bitcoin.mode]
  );
}
