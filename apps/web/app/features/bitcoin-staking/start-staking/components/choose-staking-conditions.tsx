import { bitcoinStakingConditions } from '~/content/bitcoin-staking-content';
import { StackingConditions } from '~/features/stacking/components/stacking-conditions';

import { BoxedCatLockedIcon, MagnifyingGlassIcon, StacksIcon } from '@leather.io/ui';

const iconMap = {
  BoxedCatLockedIcon: <BoxedCatLockedIcon />,
  MagnifyingGlassIcon: <MagnifyingGlassIcon />,
  StacksIcon: <StacksIcon />,
} as const;

export function ChooseStakingConditions() {
  const conditions = bitcoinStakingConditions.map(condition => ({
    icon: iconMap[condition.iconKey],
    title: condition.title,
    description: condition.description,
  }));
  return <StackingConditions conditions={conditions} />;
}
