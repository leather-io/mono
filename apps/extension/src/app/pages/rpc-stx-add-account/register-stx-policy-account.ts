import { useCallback } from 'react';

import { type RpcParams, type RpcResult, stxAddAccount } from '@leather.io/rpc';

import { logger } from '@shared/logger';
import { broadcastReplayAction } from '@shared/messages';

import { useAppDispatch } from '@app/store';
import { useCurrentAccountId } from '@app/store/accounts/account';
import {
  useCurrentNetwork,
  useCurrentNetworkId,
  useNetworks,
} from '@app/store/networks/networks.selectors';
import { userAddsPolicyAccount } from '@app/store/policy/policy.slice';

import { createStxPolicyAccountRegistration } from './stx-policy-account-registration';

// Derives the multisig address from the ordered public keys + threshold, saves
// it to state associated with the active singlesig account, and returns the RPC
// result. Returns null if address derivation unexpectedly fails (the public keys
// and threshold are validated upstream), so the caller can surface an RPC error
// rather than hang.
export function useRegisterStxPolicyAccount() {
  const dispatch = useAppDispatch();
  const { fingerprint, accountIndex } = useCurrentAccountId();
  const defaultNetwork = useCurrentNetwork();
  const defaultNetworkId = useCurrentNetworkId();
  const networks = useNetworks();

  return useCallback(
    (params: RpcParams<typeof stxAddAccount>): RpcResult<typeof stxAddAccount> | null => {
      try {
        const { addPolicyAccountPayload, result } = createStxPolicyAccountRegistration({
          params,
          fingerprint,
          accountIndex,
          defaultNetwork,
          defaultNetworkId,
          networks,
        });
        const action = userAddsPolicyAccount(addPolicyAccountPayload);
        dispatch(action);
        void broadcastReplayAction(action);

        return result;
      } catch (e) {
        logger.error('Failed to register STX policy account', e);
        return null;
      }
    },
    [dispatch, fingerprint, accountIndex, defaultNetwork, defaultNetworkId, networks]
  );
}
