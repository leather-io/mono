import { TokenBalance } from '@/features/token/components/token-balance';

import { RuneBalance } from '@leather.io/services';
import { RunesAvatarIcon } from '@leather.io/ui/native';

interface RunesTokenBalanceProps {
  item: RuneBalance;
  onPress?(): void;
}
export function RunesTokenBalance({ item, onPress }: RunesTokenBalanceProps) {
  return (
    <TokenBalance
      icon={<RunesAvatarIcon />}
      ticker={item.asset.symbol}
      tokenName={item.asset.runeName}
      availableBalance={item.crypto.availableBalance}
      quoteBalance={item.quote.availableBalance}
      onPress={onPress}
    />
  );
}
