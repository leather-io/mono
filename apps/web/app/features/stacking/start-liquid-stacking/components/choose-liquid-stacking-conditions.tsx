import { PostLabelHoverCard } from '~/components/posts/post-label-hover-card';
import { content } from '~/data/content';
import { StackingConditions } from '~/features/stacking/components/stacking-conditions';
import { getPosts } from '~/utils/post-utils';

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
  const liquidStackingConditions = content.liquidStackingConditions.map(condition => ({
    icon: iconMap[condition.iconKey as keyof typeof iconMap] || null,
    title: condition.title,
    description: condition.description,
  }));
  const posts = getPosts();
  const post = posts.liquidStackingConditions;

  return (
    <>
      <PostLabelHoverCard
        post={post}
        label="Liquid Stacking Conditions"
        textStyle="label.01"
        tagName="h1"
      />
      <StackingConditions conditions={liquidStackingConditions} />
    </>
  );
}
