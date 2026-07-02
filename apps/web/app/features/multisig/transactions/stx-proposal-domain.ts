import { type TupleCV, stringAsciiCV, tupleCV, uintCV } from '@stacks/transactions';
import { customNetwork } from '~/constants/custom-network';

import { multisigProposalDomainTag } from '@leather.io/crypto';
import type { AuthNetworkId } from '@leather.io/models';

const stxMainnetChainId = 1;
const stxTestnetChainId = 2147483648;

// SIP-018 domain for the STX proposal commitment.
export function buildStxProposalDomain(network: AuthNetworkId): TupleCV {
  const testnetChainId = customNetwork?.stacksChainId ?? stxTestnetChainId;
  const chainId = network === 'stx:mainnet' ? stxMainnetChainId : testnetChainId;
  return tupleCV({
    name: stringAsciiCV(multisigProposalDomainTag),
    version: stringAsciiCV('1'),
    'chain-id': uintCV(chainId),
  });
}
