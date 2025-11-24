import { RuneBalance } from '@leather.io/services';
import { RunesAvatarIcon } from '@leather.io/ui';

import { TokenBalance } from './token-balance';

interface RunesTokenBalanceProps {
  item: RuneBalance;
  onClick?(): void;
}

export function RunesTokenBalance({ item, onClick }: RunesTokenBalanceProps) {
  return (
    <TokenBalance
      icon={<RunesAvatarIcon />}
      tokenName={item.asset.runeName}
      ticker={item.asset.symbol}
      availableBalance={item.crypto.availableBalance}
      quoteBalance={item.quote.availableBalance}
      onClick={onClick}
    />
  );
}
