import { compileWshDescriptor, getWshDescriptorThreshold } from '@leather.io/bitcoin';
import { type AccountAddresses } from '@leather.io/models';

import { type PolicyStore, parsePolicyParent } from './policy-store.utils';

export function createPolicyAddresses(policy: PolicyStore): AccountAddresses {
  const id = parsePolicyParent(policy.parentAccountId);

  if (policy.chain === 'bitcoin') {
    const { keys } = compileWshDescriptor(policy.descriptor);
    return {
      id,
      bitcoin: {
        type: 'fixedAddress',
        address: policy.address,
        paymentType: 'p2wsh',
        multisig: {
          threshold: getWshDescriptorThreshold(policy.descriptor),
          signerCount: keys.length,
        },
      },
    };
  }

  return { id, stacks: { stxAddress: policy.address } };
}
