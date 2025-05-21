import { PostLabelHoverCard } from '~/components/post-label-hover-card';
import { content } from '~/data/content';
import { StackingConditions } from '~/features/stacking/components/stacking-conditions';
import { mapConditionsWithIcons } from '~/shared/stacking-icon-map';
import { getPosts } from '~/utils/post-utils';

/**
 * Component for choosing liquid stacking conditions
 * Uses shared icon mapping to display condition icons
 */
export function ChooseLiquidStackingConditions() {
  const liquidStackingConditions = mapConditionsWithIcons(content.liquidStackingConditions);
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
