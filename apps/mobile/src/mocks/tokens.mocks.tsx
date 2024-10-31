import { t } from '@lingui/macro';
import BigNumber from 'bignumber.js';

import { Money } from '@leather.io/models';
import { BtcAvatarIcon, StxAvatarIcon } from '@leather.io/ui/native';

import { mockTotalBalance } from './balance.mocks';

export interface Token {
  availableBalance: Record<string, Money>;
  formattedBalance: { isAbbreviated: boolean; value: string };
  ticker: string;
  fiatBalance: Money;
  icon: React.ReactNode;
  tokenName: string;
  [key: string]: any; // FIXME - added this to appease typescript
}

export const getMockTokens = (): Token[] => [
  {
    chain: t`Stacks blockchain`,
    availableBalance: {
      availableBalance: {
        amount: new BigNumber('649141443'),
        symbol: 'STX',
        decimals: 6,
      },
      lockedBalance: {
        amount: new BigNumber('99000000'),
        symbol: 'STX',
        decimals: 6,
      },
    },
    formattedBalance: { isAbbreviated: false, value: '649.141443' },
    fiatBalance: mockTotalBalance,
    fiatLockedBalance: mockTotalBalance,
    icon: <StxAvatarIcon />,
    // currently hardcoded in crypto-asset-item.layout.utils.ts
    ticker: 'stx',
    tokenName: t`Stacks`,
  },
  {
    chain: t`Stacks L2`,
    availableBalance: {
      availableBalance: {
        amount: new BigNumber('215005'),
        symbol: 'sBTC',
        decimals: 8,
      },
    },
    formattedBalance: { isAbbreviated: false, value: '0.00215005' },
    fiatBalance: mockTotalBalance,
    icon: <BtcAvatarIcon />,
    ticker: 'sbtc',
    tokenName: t`Bitcoin`,
  },
];
