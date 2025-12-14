import { AssetAvatar } from '@/components/asset-avatar';
import { TokenBalance } from '@/features/token/components/token-balance';

import { RuneBalance } from '@leather.io/services';

interface RunesTokenBalanceProps {
  item: RuneBalance;
  onPress?(): void;
}
export function RunesTokenBalance({ item, onPress }: RunesTokenBalanceProps) {
  return (
    <TokenBalance
      icon={<AssetAvatar asset={item.asset} />}
      ticker={item.asset.symbol}
      tokenName={item.asset.runeName}
      availableBalance={item.crypto.availableBalance}
      quoteBalance={item.quote.availableBalance}
      onPress={onPress}
    />
  );
}
