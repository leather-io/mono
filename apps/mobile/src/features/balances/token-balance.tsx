import { ReactNode } from 'react';

import { Balance } from '@/components/balance/balance';

import { Money } from '@leather.io/models';
import { Flag, ItemLayout, Pressable } from '@leather.io/ui/native';

interface TokenBalanceProps {
  ticker: string;
  icon: ReactNode;
  tokenName: string;
  availableBalance?: Money;
  chain: string;
  fiatBalance: Money;
  onPress?(): void;
}
export function TokenBalance({
  ticker,
  icon,
  tokenName,
  availableBalance,
  chain,
  fiatBalance,
  onPress,
}: TokenBalanceProps) {
  return (
    <Pressable flexDirection="row" disabled={!onPress} onPress={onPress}>
      <Flag key={ticker} img={icon}>
        <ItemLayout
          titleLeft={tokenName}
          titleRight={availableBalance && <Balance balance={availableBalance} />}
          captionLeft={chain}
          captionRight={<Balance balance={fiatBalance} color="ink.text-subdued" />}
        />
      </Flag>
    </Pressable>
  );
}
