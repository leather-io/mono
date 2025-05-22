import { StackingConditions } from '~/features/stacking/components/stacking-conditions';

import { BoxedCatLockedIcon, MagnifyingGlassIcon, StacksIcon } from '@leather.io/ui';
import { content } from '~/data/content';

const iconMap: Record<string, JSX.Element> = {
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
