import { useCallback } from 'react';

import { type RpcParams, type RpcResult, stxAddAccount } from '@leather.io/rpc';

import { logger } from '@shared/logger';

import { persistor, useAppDispatch } from '@app/store';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { userAddsPolicy } from '@app/store/policy/policy.slice';

import { createStxPolicyRegistration } from './stx-policy-registration';

// Derives the multisig address from the ordered public keys + threshold, saves
// it to state associated with the active singlesig account, and returns the RPC
// result. Returns null if address derivation unexpectedly fails (the public keys
// and threshold are validated upstream), so the caller can surface an RPC error
// rather than hang.
export function useRegisterStxPolicy() {
  const dispatch = useAppDispatch();
  const { fingerprint, accountIndex } = useCurrentAccountId();
  const network = useCurrentNetwork();

  return useCallback(
    async (
      params: RpcParams<typeof stxAddAccount>
    ): Promise<RpcResult<typeof stxAddAccount> | null> => {
      try {
        const { addPolicyPayload, result } = createStxPolicyRegistration({
          params,
          fingerprint,
          accountIndex,
          network,
        });
        dispatch(userAddsPolicy(addPolicyPayload));
        // The approval window closes right after responding; the write must be
        // on disk before then or the dApp gets a success for a policy that was
        // never persisted
        await persistor.flush();

        return result;
      } catch (e) {
        logger.error('Failed to register STX policy', e);
        return null;
      }
    },
    [dispatch, fingerprint, accountIndex, network]
  );
}
