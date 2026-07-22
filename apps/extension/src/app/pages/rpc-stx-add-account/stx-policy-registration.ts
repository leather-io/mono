import { makeAccountIdentifer } from '@leather.io/crypto';
import { type NetworkConfiguration } from '@leather.io/models';
import { type RpcParams, stxAddAccount } from '@leather.io/rpc';
import { deriveStxMultisigAddress } from '@leather.io/stacks';

import { makePolicyId } from '@app/store/policy/policy-store.utils';

interface DeriveStxPolicyAddressArgs {
  params: RpcParams<typeof stxAddAccount>;
  network: NetworkConfiguration;
}

// Derives the multisig address from the ordered public keys + threshold,
// resolving the requested network the same way registration does so the address
// shown in the approver is byte-identical to what gets stored and returned.
export function deriveStxPolicyAddress({ params, network }: DeriveStxPolicyAddressArgs) {
  const address = deriveStxMultisigAddress({
    publicKeys: params.publicKeys,
    threshold: params.threshold,
    chainId: network.chain.stacks.chainId,
  });
  return { address, networkId: network.id };
}

interface CreateStxPolicyRegistrationArgs {
  params: RpcParams<typeof stxAddAccount>;
  fingerprint: string;
  accountIndex: number;
  network: NetworkConfiguration;
}

export function createStxPolicyRegistration({
  params,
  fingerprint,
  accountIndex,
  network,
}: CreateStxPolicyRegistrationArgs) {
  const { address, networkId } = deriveStxPolicyAddress({ params, network });
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
      added: true,
    },
  };
}
