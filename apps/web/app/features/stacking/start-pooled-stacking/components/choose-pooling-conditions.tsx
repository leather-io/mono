import { ReactNode } from 'react';

import { content } from '~/data/content';
import { StackingConditions } from '~/features/stacking/components/stacking-conditions';

import { BoxedCatLockedIcon, MagnifyingGlassIcon, StacksIcon } from '@leather.io/ui';

const iconMap: Record<string, ReactNode> = {
  BoxedCatLockedIcon: <BoxedCatLockedIcon />,
  MagnifyingGlassIcon: <MagnifyingGlassIcon />,
  StacksIcon: <StacksIcon />,
};
const poolingConditions = content.stackingConditions.map(cond => ({
  ...cond,
  icon: iconMap[cond.iconKey] || null,
}));

export function ChoosePoolingConditions() {
  return <StackingConditions conditions={poolingConditions} />;
}
