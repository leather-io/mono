import {
  compileWshDescriptor,
  getAddressFromOutScript,
  getBtcSignerLibNetworkConfigByMode,
} from '@leather.io/bitcoin';
import { makeAccountIdentifer } from '@leather.io/crypto';
import { type NetworkConfiguration } from '@leather.io/models';
import { type RpcParams, btcAddAccount } from '@leather.io/rpc';

import { makePolicyId } from '@app/store/policy/policy-store.utils';

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

interface CreateBtcPolicyRegistrationArgs {
  params: RpcParams<typeof btcAddAccount>;
  fingerprint: string;
  accountIndex: number;
  defaultNetwork: NetworkConfiguration;
  defaultNetworkId: string;
  networks: Record<string, NetworkConfiguration>;
}

export function createBtcPolicyRegistration({
  params,
  fingerprint,
  accountIndex,
  defaultNetwork,
  defaultNetworkId,
  networks,
}: CreateBtcPolicyRegistrationArgs) {
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
    addPolicyPayload: {
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
