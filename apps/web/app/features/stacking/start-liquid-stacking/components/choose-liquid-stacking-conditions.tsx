import { StackingConditions } from '~/features/stacking/components/stacking-conditions';
import { PostLabelHoverCard } from '~/components/post-label-hover-card';

import { BoxedCatLockedIcon, MagnifyingGlassIcon, StacksIcon } from '@leather.io/ui';
import { content } from '~/data/content';

const iconMap: Record<string, JSX.Element> = {
  BoxedCatLockedIcon: <BoxedCatLockedIcon />,
  MagnifyingGlassIcon: <MagnifyingGlassIcon />,
  StacksIcon: <StacksIcon />,
};
const liquidStackingConditions = content.liquidStackingConditions.map(cond => ({
  ...cond,
  icon: iconMap[cond.iconKey] || null,
}));

export function ChooseLiquidStackingConditions() {
  return (
    <>
      <PostLabelHoverCard postKey="liquid-stacking-conditions" textStyle="label.01" tagName="h1" />
      <StackingConditions conditions={liquidStackingConditions} />
    </>
  );
}
