import { useCallback } from 'react';

import { getWshDescriptorAddress } from '@leather.io/bitcoin';
import { makeAccountIdentifer } from '@leather.io/crypto';
import { type RpcParams, type RpcResult, btcAddAccount } from '@leather.io/rpc';

import { logger } from '@shared/logger';

import { useAppDispatch } from '@app/store';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { makePolicyId } from '@app/store/policy/policy-store.utils';
import { userAddsPolicyAccount } from '@app/store/policy/policy.slice';

// Derives the policy account's address from the descriptor, saves it to state
// associated with the active singlesig account, and returns the RPC result.
// Returns null if address derivation unexpectedly fails (the descriptor is
// validated upstream), so the caller can surface an RPC error rather than hang.
export function useRegisterBtcPolicyAccount() {
  const dispatch = useAppDispatch();
  const { fingerprint, accountIndex } = useCurrentAccountId();

  return useCallback(
    (params: RpcParams<typeof btcAddAccount>): RpcResult<typeof btcAddAccount> | null => {
      try {
        const address = getWshDescriptorAddress(params.descriptor);
        const parentAccountId = makeAccountIdentifer(fingerprint, accountIndex);
        // The approval gate guarantees the active account is a cosigner.
        const role = 'signer' as const;

        dispatch(
          userAddsPolicyAccount({
            policy: {
              id: makePolicyId(parentAccountId, address),
              parentAccountId,
              chain: 'bitcoin',
              address,
              descriptor: params.descriptor,
              role,
            },
            name: params.name,
          })
        );

        return { address, descriptor: params.descriptor, accountId: address, role };
      } catch (e) {
        logger.error('Failed to register BTC policy account', e);
        return null;
      }
    },
    [dispatch, fingerprint, accountIndex]
  );
}
