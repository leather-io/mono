import { isRuneBalance, isSip10Balance } from '@leather.io/features';
import { RuneBalance, Sip10Balance } from '@leather.io/services';

import { RunesTokenBalance } from '../bitcoin/runes-token-balance';
import { Sip10TokenBalance } from '../stacks/sip10-token-balance';

export function renderAsset({
  item,
  onPress,
}: {
  item: Sip10Balance | RuneBalance;
  onPress?(): void;
}) {
  if (isSip10Balance(item)) {
    return <Sip10TokenBalance key={item.asset.contractId} item={item} onPress={onPress} />;
  }
  if (isRuneBalance(item)) {
    return <RunesTokenBalance key={item.asset.symbol} item={item} onPress={onPress} />;
  }
  return null;
}
