import { type HTMLStyledProps } from 'leather-styles/jsx';
import { Explainer } from '~/components/explainer';
import { content } from '~/data/content';
import { PostLabelHoverCard } from '~/components/post-label-hover-card';
import { sanitizeContent } from '~/utils/sanitize-content';
import { getPostByKey } from '~/utils/post-utils';

export function StackingExplainer(props: HTMLStyledProps<'section'>) {
  return (
    <Explainer {...props}>
      {content.stackingExplainer.map((step, idx) => {
        const post = getPostByKey(step.postKey);
        return (
          <Explainer.Step
            key={step.title}
            index={idx}
            title={
              <PostLabelHoverCard 
                post={post}
                label={step.title} 
                textStyle="label.01" 
                tagName="h3" 
              />
            }
            description={sanitizeContent(step.description)}
          />
        );
      })}
    </Explainer>
  );
}
