import { LearnHoverCard } from '~/components/learn-hover-card';
import { learnArticles } from '~/content/learn-content';
import { liquidStackingConditions } from '~/content/stacking-content';
import { StackingConditions } from '~/features/stacking/components/stacking-conditions';

import { BoxedCatLockedIcon, MagnifyingGlassIcon, StacksIcon } from '@leather.io/ui';

const iconMap = {
  BoxedCatLockedIcon: <BoxedCatLockedIcon />,
  MagnifyingGlassIcon: <MagnifyingGlassIcon />,
  StacksIcon: <StacksIcon />,
} as const;

/**
 * Component for choosing liquid stacking conditions
 */
export function ChooseLiquidStackingConditions() {
  const conditions = liquidStackingConditions.map(condition => ({
    icon: iconMap[condition.iconKey] || null,
    title: condition.title,
    description: condition.description,
  }));
  const article = learnArticles.liquidStackingConditions;

  return (
    <>
      <LearnHoverCard
        article={article}
        label="Liquid Stacking Conditions"
        textStyle="label.01"
        tagName="h1"
      />
      <StackingConditions conditions={conditions} />
    </>
  );
}
