import { bitcoinStakingConditions } from '~/content/bitcoin-staking-content';
import { StackingConditions } from '~/features/stacking/components/stacking-conditions';

import { MagnifyingGlassIcon, SbtcIcon } from '@leather.io/ui';

const iconMap = {
  MagnifyingGlassIcon: <MagnifyingGlassIcon />,
  SbtcIcon: <SbtcIcon />,
} as const;

export function ChooseStakingConditions() {
  const conditions = bitcoinStakingConditions.map(condition => ({
    icon: iconMap[condition.iconKey],
    title: condition.title,
    description: condition.description,
  }));
  return <StackingConditions conditions={conditions} />;
}
