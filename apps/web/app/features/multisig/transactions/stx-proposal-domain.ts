import { type TupleCV, stringAsciiCV, tupleCV, uintCV } from '@stacks/transactions';

import { multisigProposalDomainTag } from '@leather.io/crypto';
import type { AuthNetworkId } from '@leather.io/models';

const stxMainnetChainId = 1;
const stxTestnetChainId = 2147483648;

// SIP-018 domain for the STX proposal commitment
export function buildStxProposalDomain(network: AuthNetworkId): TupleCV {
  const chainId = network === 'stx:mainnet' ? stxMainnetChainId : stxTestnetChainId;
  return tupleCV({
    name: stringAsciiCV(multisigProposalDomainTag),
    version: stringAsciiCV('1'),
    'chain-id': uintCV(chainId),
  });
}
