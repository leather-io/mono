import { isSip10Balance } from '@leather.io/features';
import { Sip10Balance } from '@leather.io/services';

import { Sip10TokenBalance } from '../stacks/sip10-token-balance';

export function renderAsset({ item, onPress }: { item: Sip10Balance; onPress?(): void }) {
  if (isSip10Balance(item)) {
    return <Sip10TokenBalance key={item.asset.contractId} item={item} onPress={onPress} />;
  }
  return null;
}
