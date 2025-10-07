import { type HTMLStyledProps } from 'leather-styles/jsx';
import { Explainer } from '~/components/explainer';
import { LearnHoverCard } from '~/components/learn-hover-card';
import { learnArticles } from '~/content/learn-content';
import { liquidStackingExplainer } from '~/content/stacking-content';
import { sanitizeContent } from '~/utils/sanitize-content';

export function LiquidStackingExplainer(props: HTMLStyledProps<'section'>) {
  return (
    <Explainer {...props}>
      {liquidStackingExplainer.map((step, idx) => {
        const article = step.postKey ? learnArticles[step.postKey.replace(/-/g, '')] : undefined;
        return (
          <Explainer.Step
            key={step.title}
            index={idx}
            title={<LearnHoverCard article={article} label={step.title} textStyle="label.01" />}
            description={sanitizeContent(step.description)}
          />
        );
      })}
    </Explainer>
  );
}
