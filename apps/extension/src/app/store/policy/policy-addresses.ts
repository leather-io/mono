import { compileWshDescriptor, getWshDescriptorThreshold } from '@leather.io/bitcoin';
import { type AccountAddresses } from '@leather.io/models';

import { type PolicyStore, parsePolicyParent } from './policy-store.utils';

function getPolicyMultisigInfo(descriptor: string): { threshold: number; signerCount: number } {
  try {
    const { keys } = compileWshDescriptor(descriptor);
    return {
      threshold: getWshDescriptorThreshold(descriptor),
      signerCount: keys.length,
    };
  } catch {
    return { threshold: 0, signerCount: 0 };
  }
}

export function createPolicyAddresses(policy: PolicyStore): AccountAddresses {
  const id = parsePolicyParent(policy.parentAccountId);

  if (policy.chain === 'bitcoin') {
    return {
      id,
      bitcoin: {
        type: 'fixedAddress',
        address: policy.address,
        paymentType: 'p2wsh',
        multisig: getPolicyMultisigInfo(policy.descriptor),
      },
    };
  }

  return { id, stacks: { stxAddress: policy.address } };
}
