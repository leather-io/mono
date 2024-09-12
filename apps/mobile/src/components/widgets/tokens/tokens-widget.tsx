import React, { useRef } from 'react';

import { Flag, ItemLayout, SheetRef } from '@leather.io/ui/native';
import { formatMoney } from '@leather.io/utils';

import { FiatBalance } from '../components/balance/fiat-balance';
import { formatLockedBalance } from '../components/balance/format-locked-balance';
import { TokenBalance } from '../components/balance/token-balance';
import { TokensHeader } from './tokens-header';
import { TokensWidgetLayout } from './tokens-widget.layout';
import { type Token } from './tokens.mocks';

interface TokensWidgetProps {
  tokens: Token[];
  totalBalance: string;
}

export function TokensWidget({ tokens, totalBalance }: TokensWidgetProps) {
  const sheetRef = useRef<SheetRef>(null);

  return (
    <TokensWidgetLayout
      header={<TokensHeader tokens={tokens} totalBalance={totalBalance} sheetRef={sheetRef} />}
      balance={tokens.length > 0 && <TokenBalance balance={totalBalance} />}
    >
      {tokens.map(
        ({
          availableBalance: { availableBalance, lockedBalance },
          icon,
          tokenName,
          ticker,
          chain,
          fiatBalance,
          fiatLockedBalance,
        }) => (
          <Flag key={ticker} img={icon} align="middle" spacing="1" reverse={false}>
            <ItemLayout
              titleLeft={tokenName}
              titleRight={
                availableBalance && (
                  <TokenBalance
                    balance={formatMoney(availableBalance)}
                    lockedBalance={lockedBalance ? formatLockedBalance(lockedBalance) : undefined}
                  />
                )
              }
              captionLeft={chain}
              captionRight={
                <FiatBalance
                  balance={fiatBalance}
                  lockedBalance={fiatLockedBalance || undefined}
                  color="ink.text-subdued"
                />
              }
            />
          </Flag>
        )
      )}
    </TokensWidgetLayout>
  );
}
