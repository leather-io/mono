import { t } from '@lingui/macro';
import BigNumber from 'bignumber.js';

import { Money } from '@leather.io/models';
import { BtcAvatarIcon, StxAvatarIcon } from '@leather.io/ui/native';

// provided by useTotalBalance hook in extension/src/app/common/hooks/balance/use-total-balance.tsx

export const mockTotalBalance = {
  totalUsdBalance: '$126.74',
  totalBtcBalance: '0.00215005',
  totalStxBalance: '0.0024',
};

export interface Token {
  availableBalance: Record<string, Money>;
  formattedBalance: { isAbbreviated: boolean; value: string };
  ticker: string;
  fiatBalance: string;
  icon: React.ReactNode;
  tokenName: string;
  [key: string]: any; // FIXME - added this to appease typescript
}

export const getMockTokens = (): Token[] => [
  {
    chain: t`Bitcoin blockchain`,
    availableBalance: {
      availableBalance: {
        amount: new BigNumber('215005'),
        symbol: 'BTC',
        decimals: 8,
      },
      // protectedBalance: {
      //   amount: '0',
      //   symbol: 'BTC',
      //   decimals: 8,
      // },
      // uneconomicalBalance: {
      //   amount: '0',
      //   symbol: 'BTC',
      //   decimals: 8,
      // },
    },
    formattedBalance: { isAbbreviated: false, value: '0.00215005' },
    fiatBalance: '$126.74',
    icon: <BtcAvatarIcon />,
    // currently hardcoded in crypto-asset-item.layout.utils.ts
    ticker: 'btc',
    tokenName: t`Bitcoin`,

    // isLoading: false,
    // isLoadingAdditionalData: false,
    // onSelectAsset: () => {},
  },
  {
    // TODO: fix this - could migrate crypto-asset-item.layout.utils.ts + crypto-asset-item.layout.tsx to mono and share
    // these values provided by parseCryptoAssetBalance
    chain: t`Stacks blockchain`,
    availableBalance: {
      availableBalance: {
        amount: new BigNumber('649141443'),
        symbol: 'STX',
        decimals: 6,
      },
      // availableUnlockedBalance: {
      //   amount: new BigNumber('550141443'),
      //   symbol: 'STX',
      //   decimals: 6,
      // },
      // inboundBalance: {
      //   amount: new BigNumber('0'),
      //   symbol: 'STX',
      //   decimals: 6,
      // },
      lockedBalance: {
        amount: new BigNumber('99000000'),
        symbol: 'STX',
        decimals: 6,
      },
      // outboundBalance: {
      //   amount: new BigNumber('0'),
      //   symbol: 'STX',
      //   decimals: 6,
      // },
      // pendingBalance: {
      //   amount: new BigNumber('649141443'),
      //   symbol: 'STX',
      //   decimals: 6,
      // },
      // totalBalance: {
      //   amount: new BigNumber('649141443'),
      //   symbol: 'STX',
      //   decimals: 6,
      // },
      // unlockedBalance: {
      //   amount: new BigNumber('550141443'),
      //   symbol: 'STX',
      //   decimals: 6,
      // },
    },
    formattedBalance: { isAbbreviated: false, value: '649.141443' },
    fiatBalance: '$979.79',
    // TODO: for STX locked need to hook up to
    // const marketData = useCryptoCurrencyMarketDataMeanAverage('STX');
    // const fiatLockedBalance = i18nFormatCurrency(
    //   baseCurrencyAmountInQuote(lockedBalance, marketData)
    // );
    fiatLockedBalance: '$149.61',
    icon: <StxAvatarIcon />,
    // currently hardcoded in crypto-asset-item.layout.utils.ts
    ticker: 'stx',
    tokenName: t`Stacks`,
    // isLoading: false,
    // isLoadingAdditionalData: false,
    // onSelectAsset: () => {},
  },
];
