import { useCallback } from 'react';

import { makeAccountIdentifer } from '@leather.io/crypto';
import { type RpcParams, type RpcResult, stxAddAccount } from '@leather.io/rpc';
import { deriveStxMultisigAddress } from '@leather.io/stacks';

import { logger } from '@shared/logger';

import { useAppDispatch } from '@app/store';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { makePolicyId } from '@app/store/policy/policy-store.utils';
import { userAddsPolicyAccount } from '@app/store/policy/policy.slice';

// Derives the multisig address from the ordered public keys + threshold, saves
// it to state associated with the active singlesig account, and returns the RPC
// result. Returns null if address derivation unexpectedly fails (the public keys
// and threshold are validated upstream), so the caller can surface an RPC error
// rather than hang.
export function useRegisterStxPolicyAccount() {
  const dispatch = useAppDispatch();
  const { fingerprint, accountIndex } = useCurrentAccountId();
  const network = useCurrentNetwork();

  return useCallback(
    (params: RpcParams<typeof stxAddAccount>): RpcResult<typeof stxAddAccount> | null => {
      try {
        const address = deriveStxMultisigAddress({
          publicKeys: params.publicKeys,
          threshold: params.threshold,
          chainId: network.chain.stacks.chainId,
        });
        const parentAccountId = makeAccountIdentifer(fingerprint, accountIndex);
        // The approval gate guarantees the active account is a cosigner.
        const role = 'signer' as const;

        dispatch(
          userAddsPolicyAccount({
            policy: {
              id: makePolicyId(parentAccountId, address),
              parentAccountId,
              chain: 'stacks',
              address,
              publicKeys: params.publicKeys,
              threshold: params.threshold,
              role,
            },
            name: params.name,
          })
        );

        return {
          address,
          publicKeys: params.publicKeys,
          threshold: params.threshold,
          role,
          accountId: address,
        };
      } catch (e) {
        logger.error('Failed to register STX policy account', e);
        return null;
      }
    },
    [dispatch, fingerprint, accountIndex, network.chain.stacks.chainId]
  );
}
