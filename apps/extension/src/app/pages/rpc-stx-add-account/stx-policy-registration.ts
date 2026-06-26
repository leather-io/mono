import { makeAccountIdentifer } from '@leather.io/crypto';
import { type NetworkConfiguration } from '@leather.io/models';
import { type RpcParams, stxAddAccount } from '@leather.io/rpc';
import { deriveStxMultisigAddress } from '@leather.io/stacks';

import { makePolicyId } from '@app/store/policy/policy-store.utils';

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

interface CreateStxPolicyRegistrationArgs {
  params: RpcParams<typeof stxAddAccount>;
  fingerprint: string;
  accountIndex: number;
  defaultNetwork: NetworkConfiguration;
  defaultNetworkId: string;
  networks: Record<string, NetworkConfiguration>;
}

export function createStxPolicyRegistration({
  params,
  fingerprint,
  accountIndex,
  defaultNetwork,
  defaultNetworkId,
  networks,
}: CreateStxPolicyRegistrationArgs) {
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
    addPolicyPayload: {
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
