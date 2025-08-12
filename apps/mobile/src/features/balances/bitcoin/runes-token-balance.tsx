import { TokenBalance } from '@/features/token/components/token-balance';

import { RuneBalance } from '@leather.io/services';
import { RunesAvatarIcon } from '@leather.io/ui/native';

export function RunesTokenBalance({ item }: { item: RuneBalance }) {
  return (
    <TokenBalance
      icon={<RunesAvatarIcon />}
      ticker={item.asset.symbol}
      tokenName={item.asset.runeName}
      availableBalance={item.crypto.availableBalance}
      quoteBalance={item.quote.availableBalance}
    />
  );
}
