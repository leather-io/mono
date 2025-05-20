import { type HTMLStyledProps } from 'leather-styles/jsx';
import { Explainer } from '~/components/explainer';
import { content } from '~/data/content';
import { PostLabelHoverCard } from '~/components/post-label-hover-card';
import { useEffect } from 'react';
import { sanitizeContent } from '~/utils/sanitize-content';

export function StackingExplainer(props: HTMLStyledProps<'section'>) {
  return (
    <Explainer {...props}>
      {content.stackingExplainer.map((step, idx) => (
        <Explainer.Step
          key={step.title}
          index={idx}
          title={step.title}
          description={sanitizeContent(step.description)}
        />
      ))}
    </Explainer>
  );
}
