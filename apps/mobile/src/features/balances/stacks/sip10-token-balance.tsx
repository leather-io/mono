import { AssetAvatar } from '@/components/asset-avatar';
import { TokenBalance } from '@/features/token/components/token-balance';

import { Sip10Balance as Sip10BalanceType } from '@leather.io/services';

interface Sip10TokenBalanceProps {
  item: Sip10BalanceType;
  onPress?(): void;
}
export function Sip10TokenBalance({ item, onPress }: Sip10TokenBalanceProps) {
  return (
    <TokenBalance
      icon={<AssetAvatar asset={item.asset} />}
      availableBalance={item.crypto.availableBalance}
      quoteBalance={item.quote.totalBalance}
      onPress={onPress}
      tokenName={item.asset.name}
      ticker={item.asset.symbol}
    />
  );
}
