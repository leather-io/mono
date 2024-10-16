import { ReactNode } from 'react';

import { Balance } from '@/components/balance/balance';

import { Money } from '@leather.io/models';
import { Flag, ItemLayout } from '@leather.io/ui/native';

interface TokenBalanceProps {
  ticker: string;
  icon: ReactNode;
  tokenName: string;
  availableBalance?: Money;
  chain: string;
  fiatBalance: Money;
  showChain: boolean; // true for all tokens except BTC and STX
}
export function TokenBalance({
  ticker,
  icon,
  tokenName,
  availableBalance,
  chain,
  fiatBalance,
  showChain,
}: TokenBalanceProps) {
  return (
    <Flag key={ticker} img={icon} align="middle" spacing="1" reverse={false}>
      <ItemLayout
        titleLeft={tokenName}
        titleRight={availableBalance && <Balance balance={availableBalance} />}
        captionLeft={showChain ? chain : ''}
        captionRight={<Balance balance={fiatBalance} color="ink.text-subdued" />}
      />
    </Flag>
  );
}
