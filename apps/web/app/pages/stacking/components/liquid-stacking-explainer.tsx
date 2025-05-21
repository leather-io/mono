import { type HTMLStyledProps } from 'leather-styles/jsx';
import { Explainer } from '~/components/explainer';
import { content } from '~/data/content';
import { sanitizeContent } from '~/utils/sanitize-content';
import { PostLabelHoverCard } from '~/components/post-label-hover-card';
import type { PostsCollection } from '~/data/post-types';

export function LiquidStackingExplainer(props: HTMLStyledProps<'section'>) {
  const posts = content.posts as unknown as PostsCollection;
  return (
    <Explainer {...props}>
      {content.liquidStackingExplainer.map((step, idx) => (
        <Explainer.Step
          key={step.title}
          index={idx}
          title={<PostLabelHoverCard postKey={step.postKey} label={step.title} textStyle="label.01" tagName="h3" />}
          description={sanitizeContent(step.description)}
        />
      ))}
    </Explainer>
  );
}
