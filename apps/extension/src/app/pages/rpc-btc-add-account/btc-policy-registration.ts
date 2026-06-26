import {
  compileWshDescriptor,
  getAddressFromOutScript,
  getBtcSignerLibNetworkConfigByMode,
  getWshDescriptorNetwork,
} from '@leather.io/bitcoin';
import { makeAccountIdentifer } from '@leather.io/crypto';
import {
  type NetworkConfiguration,
  WalletDefaultNetworkConfigurationIds,
} from '@leather.io/models';
import { type RpcParams, btcAddAccount } from '@leather.io/rpc';

import { makePolicyId } from '@app/store/policy/policy-store.utils';

interface ResolveBtcPolicyNetworkArgs {
  paramsNetwork: string | undefined;
  networks: Record<string, NetworkConfiguration>;
}

function resolveBtcPolicyNetwork({ paramsNetwork, networks }: ResolveBtcPolicyNetworkArgs) {
  const networkKey = paramsNetwork ?? WalletDefaultNetworkConfigurationIds.mainnet;

  const network = networks[networkKey];
  if (!network) throw new Error(`Unknown BTC add account network: ${networkKey}`);

  return { network, networkId: network.id };
}

interface CreateBtcPolicyRegistrationArgs {
  params: RpcParams<typeof btcAddAccount>;
  fingerprint: string;
  accountIndex: number;
  networks: Record<string, NetworkConfiguration>;
}

export function createBtcPolicyRegistration({
  params,
  fingerprint,
  accountIndex,
  networks,
}: CreateBtcPolicyRegistrationArgs) {
  const { network, networkId } = resolveBtcPolicyNetwork({
    paramsNetwork: params.network,
    networks,
  });

  const descriptorNetwork = getWshDescriptorNetwork(params.descriptor);
  const resolvedNetwork = network.chain.bitcoin.mode === 'mainnet' ? 'mainnet' : 'testnet';
  if (descriptorNetwork && descriptorNetwork !== resolvedNetwork)
    throw new Error(
      `BTC descriptor network (${descriptorNetwork}) does not match requested network (${networkId})`
    );

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
