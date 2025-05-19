import { type HTMLStyledProps } from 'leather-styles/jsx';
import { Explainer } from '~/components/explainer';
import { content } from '~/data/content';
import { PostLabelHoverCard } from '~/components/post-label-hover-card';
import { useEffect } from 'react';
import { sanitizeContent } from '~/utils/sanitize-content';

export function StackingExplainer(props: HTMLStyledProps<'section'>) {
  // SSR log
  // eslint-disable-next-line no-console
  console.log('[SSR] stackingExplainer', content.stackingExplainer);
  // eslint-disable-next-line no-console
  console.log('[SSR] posts', content.posts);
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[Client] stackingExplainer', content.stackingExplainer);
    // eslint-disable-next-line no-console
    console.log('[Client] posts', content.posts);
  }, []);

  return (
    <Explainer {...props}>
      {content.stackingExplainer.map((step, idx) => (
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
