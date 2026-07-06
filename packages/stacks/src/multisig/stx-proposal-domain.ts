import {
  ClarityType,
  type StringAsciiCV,
  type TupleCV,
  type UIntCV,
  stringAsciiCV,
  uintCV,
} from '@stacks/transactions';

import { multisigProposalDomainTag } from '@leather.io/crypto';
import type { AuthNetworkId } from '@leather.io/models';

const stxMainnetChainId = 1;
const stxTestnetChainId = 2147483648;

// SIP-018 domain for the STX proposal commitment
export function buildStxProposalDomain(
  network: AuthNetworkId
): TupleCV<{ name: StringAsciiCV; version: StringAsciiCV; 'chain-id': UIntCV }> {
  const chainId = network === 'stx:mainnet' ? stxMainnetChainId : stxTestnetChainId;
  return {
    type: ClarityType.Tuple,
    value: {
      name: stringAsciiCV(multisigProposalDomainTag),
      version: stringAsciiCV('1'),
      'chain-id': uintCV(chainId),
    },
  };
}
