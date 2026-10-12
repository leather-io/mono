import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getOriginFromUrl } from '@shared/utils/urls';

import { useCurrentAccountId } from '../accounts/account';
import { useCurrentNetwork } from '../networks/networks.selectors';
import { appPermissionsSelectors } from './app-permissions.selectors';
import { appPermissionsSlice } from './app-permissions.slice';

export function useAppPermissions() {
  const dispatch = useDispatch();
  const account = useCurrentAccountId();
  const currentNetwork = useCurrentNetwork();
  const allAppPermissions = useSelector(appPermissionsSelectors.selectAll);

  return useMemo(
    () => ({
      allAppPermissions,
      hasRequestedAccounts(origin: string, policyId?: string) {
        const canonicalOrigin = getOriginFromUrl(origin);
        dispatch(
          appPermissionsSlice.actions.updatePermission({
            ...account,
            origin: canonicalOrigin,
            requestedAccounts: new Date().toISOString(),
            networkMode: currentNetwork.chain.bitcoin.mode,
            ...(policyId ? { policyId } : {}),
          })
        );
      },
    }),
    [dispatch, account, currentNetwork.chain.bitcoin.mode, allAppPermissions]
  );
}
