import { useCallback } from 'react';

import { makeAccountIdentifer } from '@leather.io/crypto';
import { type NetworkConfiguration } from '@leather.io/models';
import { type RpcParams, type RpcResult, stxAddAccount } from '@leather.io/rpc';
import { deriveStxMultisigAddress } from '@leather.io/stacks';

import { logger } from '@shared/logger';
import { broadcastReplayAction } from '@shared/messages';

import { useAppDispatch } from '@app/store';
import { useCurrentAccountId } from '@app/store/accounts/account';
import {
  useCurrentNetwork,
  useCurrentNetworkId,
  useNetworks,
} from '@app/store/networks/networks.selectors';
import { makePolicyId } from '@app/store/policy/policy-store.utils';
import { userAddsPolicyAccount } from '@app/store/policy/policy.slice';

interface ResolveStxPolicyNetworkArgs {
  paramsNetwork: string | undefined;
  defaultNetwork: NetworkConfiguration;
  defaultNetworkId: string;
  networks: Record<string, NetworkConfiguration>;
}

function resolveStxPolicyNetwork({
  paramsNetwork,
  defaultNetwork,
  defaultNetworkId,
  networks,
}: ResolveStxPolicyNetworkArgs) {
  if (!paramsNetwork) return { network: defaultNetwork, networkId: defaultNetworkId };

  const requestedNetwork = networks[paramsNetwork];
  if (!requestedNetwork) throw new Error(`Unknown STX add account network: ${paramsNetwork}`);

  return { network: requestedNetwork, networkId: requestedNetwork.id };
}

interface CreateStxPolicyAccountRegistrationArgs {
  params: RpcParams<typeof stxAddAccount>;
  fingerprint: string;
  accountIndex: number;
  defaultNetwork: NetworkConfiguration;
  defaultNetworkId: string;
  networks: Record<string, NetworkConfiguration>;
}

export function createStxPolicyAccountRegistration({
  params,
  fingerprint,
  accountIndex,
  defaultNetwork,
  defaultNetworkId,
  networks,
}: CreateStxPolicyAccountRegistrationArgs) {
  const { network, networkId } = resolveStxPolicyNetwork({
    paramsNetwork: params.network,
    defaultNetwork,
    defaultNetworkId,
    networks,
  });
  const address = deriveStxMultisigAddress({
    publicKeys: params.publicKeys,
    threshold: params.threshold,
    chainId: network.chain.stacks.chainId,
  });
  const parentAccountId = makeAccountIdentifer(fingerprint, accountIndex);
  const role = 'signer' as const;

  return {
    addPolicyAccountPayload: {
      policy: {
        id: makePolicyId(parentAccountId, address, networkId),
        parentAccountId,
        networkId,
        chain: 'stacks' as const,
        address,
        publicKeys: params.publicKeys,
        threshold: params.threshold,
        role,
      },
      name: params.name,
    },
    result: {
      address,
      publicKeys: params.publicKeys,
      threshold: params.threshold,
      role,
      accountId: address,
    },
  };
}

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
