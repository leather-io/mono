import { content } from '~/data/content';
import { StackingConditions } from '~/features/stacking/components/stacking-conditions';

import { BoxedCatLockedIcon, MagnifyingGlassIcon, StacksIcon } from '@leather.io/ui';

const iconMap = {
  BoxedCatLockedIcon: <BoxedCatLockedIcon />,
  MagnifyingGlassIcon: <MagnifyingGlassIcon />,
  StacksIcon: <StacksIcon />,
} as const;

/**
 * Component for choosing pooled stacking conditions
 */
export function ChoosePoolingConditions() {
  const poolingConditions = content.stackingConditions.map(condition => ({
    icon: iconMap[condition.iconKey] || null,
    title: condition.title,
    description: condition.description,
  }));
  return <StackingConditions conditions={poolingConditions} />;
}
