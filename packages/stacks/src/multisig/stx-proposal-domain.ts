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

export const stxChainIdByAuthNetworkId: Record<AuthNetworkId, number> = {
  'stx:mainnet': stxMainnetChainId,
  'stx:testnet': stxTestnetChainId,
  'btc:mainnet': stxTestnetChainId,
  'btc:testnet': stxTestnetChainId,
  'btc:regtest': stxTestnetChainId,
};

// SIP-018 domain for the STX proposal commitment
export function buildStxProposalDomain(
  chainId: number
): TupleCV<{ name: StringAsciiCV; version: StringAsciiCV; 'chain-id': UIntCV }> {
  return {
    type: ClarityType.Tuple,
    value: {
      name: stringAsciiCV(multisigProposalDomainTag),
      version: stringAsciiCV('1'),
      'chain-id': uintCV(chainId),
    },
  };
}
