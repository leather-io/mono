import { Token } from '@/components/widgets/tokens';
import { t } from '@lingui/macro';
import BigNumber from 'bignumber.js';

import { BtcAvatarIcon, StxAvatarIcon } from '@leather.io/ui/native';

import { mockTotalBalance } from './balance.mocks';

export const getMockTokens = (): Token[] => [
  {
    chain: t`Bitcoin blockchain`,
    availableBalance: {
      availableBalance: {
        amount: new BigNumber('215005'),
        symbol: 'BTC',
        decimals: 8,
      },
    },
    fiatBalance: mockTotalBalance,
    icon: <BtcAvatarIcon />,
    // currently hardcoded in crypto-asset-item.layout.utils.ts
    ticker: 'btc',
    tokenName: t`Bitcoin`,
  },
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
    fiatBalance: mockTotalBalance,
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
    fiatBalance: mockTotalBalance,
    icon: <BtcAvatarIcon />,
    ticker: 'sbtc',
    tokenName: t`Bitcoin`,
  },
];
