import { RuneBalance, Sip10Balance } from '@leather.io/services';

import { RunesTokenBalance } from '../bitcoin/runes-token-balance';
import { Sip10TokenBalance } from '../stacks/sip10-token-balance';

export function renderAsset({
  item,
  onPress,
}: {
  item: Sip10Balance | RuneBalance;
  onPress?(tokenId: string): void;
}) {
  switch (item.asset.protocol) {
    case 'sip10':
      return (
        <Sip10TokenBalance
          key={item.asset.contractId}
          item={item as Sip10Balance}
          onPress={() => onPress?.(item.asset.symbol)}
        />
      );
    case 'rune':
      return <RunesTokenBalance key={item.asset.symbol} item={item as RuneBalance} />;
    default:
      return null;
  }
}
