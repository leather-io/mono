import { useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { getHostnameFromUrl } from '@shared/utils/urls';

import { useCurrentAccountId } from '../accounts/account';
import { useCurrentNetwork } from '../networks/networks.selectors';
import { appPermissionsSlice } from './app-permissions.slice';

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
