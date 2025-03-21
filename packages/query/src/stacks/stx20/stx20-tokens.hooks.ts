import { Stx20CryptoAssetInfo } from '@leather.io/models';

import { Stx20Balance } from '../stx20-api-types';

export function createStx20CryptoAssetInfo(
  stx20Balance: Stx20Balance
): Partial<Stx20CryptoAssetInfo> {
  return {
    chain: 'stacks',
    category: 'fungible',
    protocol: 'stx20',
    symbol: stx20Balance.ticker,
  };
}
