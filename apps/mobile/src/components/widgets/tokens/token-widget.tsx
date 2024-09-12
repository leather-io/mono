import React, { useRef } from 'react';

import { Flag, ItemLayout, SheetRef, Text } from '@leather.io/ui/native';

import { FiatBalance } from '../components/balance/fiat-balance';
import { formatLockedBalance } from '../components/balance/format-locked-balance';
import { TokenBalance } from '../components/balance/token-balance';
import { TokenHeader } from './token-header';
import { TokenWidgetLayout } from './token-widget.layout';
import { type Token } from './tokens.mocks';

interface TokenWidgetProps {
  tokens: Token[];
  totalBalance: string;
}

export function TokenWidget({ tokens, totalBalance }: TokenWidgetProps) {
  const sheetRef = useRef<SheetRef>(null);

  return (
    <TokenWidgetLayout
      header={<TokenHeader tokens={tokens} totalBalance={totalBalance} sheetRef={sheetRef} />}
      balance={tokens.length > 0 && <TokenBalance balance={totalBalance} />}
    >
      {tokens.map(
        ({
          availableBalanceString,
          availableBalance,
          icon,
          tokenName,
          ticker,
          fiatBalance,
          fiatLockedBalance,
        }) => (
          <Flag key={ticker} img={icon} align="middle" spacing="1" reverse={false}>
            <ItemLayout
              titleLeft={tokenName}
              titleRight={
                <TokenBalance
                  balance={availableBalanceString}
                  lockedBalance={formatLockedBalance(availableBalance.lockedBalance) || undefined}
                />
              }
              captionLeft={
                <Text variant="label02" color="ink.text-subdued" textTransform="uppercase">
                  {ticker}
                </Text>
              }
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
    </TokenWidgetLayout>
  );
}
