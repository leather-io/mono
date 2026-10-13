import { TokenBalance } from '@/features/token/components/token-balance';

import { Sip10Balance as Sip10BalanceType } from '@leather.io/services';
import { Sip10AvatarIcon } from '@leather.io/ui/native';

interface Sip10TokenBalanceProps {
  item: Sip10BalanceType;
  onPress?(): void;
}
export function Sip10TokenBalance({ item, onPress }: Sip10TokenBalanceProps) {
  return (
    <TokenBalance
      icon={
        <Sip10AvatarIcon
          indicator="stacksIcon"
          contractId={item.asset.contractId}
          imageCanonicalUri={item.asset.imageCanonicalUri}
          name={item.asset.name}
        />
      }
      availableBalance={item.crypto.availableBalance}
      quoteBalance={item.quote.totalBalance}
      onPress={onPress}
      tokenName={item.asset.name}
      ticker={item.asset.symbol}
    />
  );
}
