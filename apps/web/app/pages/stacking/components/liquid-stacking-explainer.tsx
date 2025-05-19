import { type HTMLStyledProps } from 'leather-styles/jsx';
import { Explainer } from '~/components/explainer';
import { content } from '~/data/content';
import { sanitizeContent } from '~/utils/sanitize-content';

export function LiquidStackingExplainer(props: HTMLStyledProps<'section'>) {
  return (
    <Explainer {...props}>
      {content.liquidStackingExplainer.map((step, idx) => (
        <Explainer.Step
          key={step.title}
          index={idx}
          title={step.title}
          post={content.posts[step.postKey]}
          description={sanitizeContent(step.description)}
        />
      ))}
    </Explainer>
  );
}
