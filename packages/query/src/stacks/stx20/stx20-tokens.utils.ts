import { Stx20Asset } from '@leather.io/models';

import { Stx20Balance } from '../stx20-api-types';

export function createStx20Asset(stx20Balance: Stx20Balance): Partial<Stx20Asset> {
  return {
    chain: 'stacks',
    category: 'fungible',
    protocol: 'stx20',
    symbol: stx20Balance.ticker,
  };
}
