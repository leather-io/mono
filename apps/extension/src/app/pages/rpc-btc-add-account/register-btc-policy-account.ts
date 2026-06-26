import { useCallback } from 'react';

import {
  compileWshDescriptor,
  getAddressFromOutScript,
  getBtcSignerLibNetworkConfigByMode,
} from '@leather.io/bitcoin';
import { makeAccountIdentifer } from '@leather.io/crypto';
import { type NetworkConfiguration } from '@leather.io/models';
import { type RpcParams, type RpcResult, btcAddAccount } from '@leather.io/rpc';

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

interface ResolveBtcPolicyNetworkArgs {
  paramsNetwork: string | undefined;
  defaultNetwork: NetworkConfiguration;
  defaultNetworkId: string;
  networks: Record<string, NetworkConfiguration>;
}

function resolveBtcPolicyNetwork({
  paramsNetwork,
  defaultNetwork,
  defaultNetworkId,
  networks,
}: ResolveBtcPolicyNetworkArgs) {
  if (!paramsNetwork) return { network: defaultNetwork, networkId: defaultNetworkId };

  const requestedNetwork = networks[paramsNetwork];
  if (!requestedNetwork) throw new Error(`Unknown BTC add account network: ${paramsNetwork}`);

  return { network: requestedNetwork, networkId: requestedNetwork.id };
}

interface CreateBtcPolicyAccountRegistrationArgs {
  params: RpcParams<typeof btcAddAccount>;
  fingerprint: string;
  accountIndex: number;
  defaultNetwork: NetworkConfiguration;
  defaultNetworkId: string;
  networks: Record<string, NetworkConfiguration>;
}

export function createBtcPolicyAccountRegistration({
  params,
  fingerprint,
  accountIndex,
  defaultNetwork,
  defaultNetworkId,
  networks,
}: CreateBtcPolicyAccountRegistrationArgs) {
  const { network, networkId } = resolveBtcPolicyNetwork({
    paramsNetwork: params.network,
    defaultNetwork,
    defaultNetworkId,
    networks,
  });
  const { scriptPubKey } = compileWshDescriptor(params.descriptor);
  const address = getAddressFromOutScript(
    scriptPubKey,
    getBtcSignerLibNetworkConfigByMode(network.chain.bitcoin.mode)
  );
  if (!address) throw new Error('Descriptor does not produce an address');

  const parentAccountId = makeAccountIdentifer(fingerprint, accountIndex);
  const role = 'signer' as const;

  return {
    addPolicyAccountPayload: {
      policy: {
        id: makePolicyId(parentAccountId, address, networkId),
        parentAccountId,
        networkId,
        chain: 'bitcoin' as const,
        address,
        descriptor: params.descriptor,
        role,
      },
      name: params.name,
    },
    result: { address, descriptor: params.descriptor, accountId: address, role },
  };
}

// Derives the policy account's address from the descriptor, saves it to state
// associated with the active singlesig account, and returns the RPC result.
// Returns null if address derivation unexpectedly fails (the descriptor is
// validated upstream), so the caller can surface an RPC error rather than hang.
export function useRegisterBtcPolicyAccount() {
  const dispatch = useAppDispatch();
  const { fingerprint, accountIndex } = useCurrentAccountId();
  const defaultNetwork = useCurrentNetwork();
  const defaultNetworkId = useCurrentNetworkId();
  const networks = useNetworks();

  return useCallback(
    (params: RpcParams<typeof btcAddAccount>): RpcResult<typeof btcAddAccount> | null => {
      try {
        const { addPolicyAccountPayload, result } = createBtcPolicyAccountRegistration({
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
        logger.error('Failed to register BTC policy account', e);
        return null;
      }
    },
    [dispatch, fingerprint, accountIndex, defaultNetwork, defaultNetworkId, networks]
  );
}
