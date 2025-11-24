import { Sip10Balance } from '@leather.io/services';
import { Sip10AvatarIcon } from '@leather.io/ui';

import { TokenBalance } from './token-balance';

interface Sip10TokenBalanceProps {
  item: Sip10Balance;
  onClick?(): void;
}

export function Sip10TokenBalance({ item, onClick }: Sip10TokenBalanceProps) {
  return (
    <TokenBalance
      icon={
        <Sip10AvatarIcon
          contractId={item.asset.contractId}
          imageCanonicalUri={item.asset.imageCanonicalUri}
          name={item.asset.name}
        />
      }
      tokenName={item.asset.name}
      ticker={item.asset.symbol}
      availableBalance={item.crypto.availableBalance}
      quoteBalance={item.quote.totalBalance}
      onClick={onClick}
    />
  );
}
