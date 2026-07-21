import {
  compileWshDescriptor,
  getAddressFromOutScript,
  getBtcSignerLibNetworkConfigByMode,
  getWshDescriptorNetwork,
} from '@leather.io/bitcoin';
import { makeAccountIdentifer } from '@leather.io/crypto';
import { type NetworkConfiguration } from '@leather.io/models';
import { type RpcParams, btcAddAccount } from '@leather.io/rpc';

import { makePolicyId } from '@app/store/policy/policy-store.utils';

interface DeriveBtcPolicyAddressArgs {
  params: RpcParams<typeof btcAddAccount>;
  network: NetworkConfiguration;
}

// Derives the multisig address from the descriptor, resolving the requested
// network the same way registration does so the address shown in the approver
// (and verified on Ledger) is byte-identical to what gets stored and returned.
export function deriveBtcPolicyAddress({ params, network }: DeriveBtcPolicyAddressArgs) {
  const descriptorNetwork = getWshDescriptorNetwork(params.descriptor);
  const resolvedNetwork = network.chain.bitcoin.mode === 'mainnet' ? 'mainnet' : 'testnet';
  if (descriptorNetwork && descriptorNetwork !== resolvedNetwork)
    throw new Error(
      `BTC descriptor network (${descriptorNetwork}) does not match requested network (${network.id})`
    );

  const { scriptPubKey } = compileWshDescriptor(params.descriptor);
  const address = getAddressFromOutScript(
    scriptPubKey,
    getBtcSignerLibNetworkConfigByMode(network.chain.bitcoin.mode)
  );
  if (!address) throw new Error('Descriptor does not produce an address');

  return { address, networkId: network.id };
}

interface CreateBtcPolicyRegistrationArgs {
  params: RpcParams<typeof btcAddAccount>;
  fingerprint: string;
  accountIndex: number;
  network: NetworkConfiguration;
}

export function createBtcPolicyRegistration({
  params,
  fingerprint,
  accountIndex,
  network,
}: CreateBtcPolicyRegistrationArgs) {
  const { address, networkId } = deriveBtcPolicyAddress({ params, network });

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
    result: { address, descriptor: params.descriptor, accountId: address, role, added: true },
  };
}
