import BigNumber from 'bignumber.js';

import { Money } from '@leather.io/models';

export const mockTotalBalance: Money = {
  amount: new BigNumber(2222222),
  symbol: 'USD',
  decimals: 2,
};
