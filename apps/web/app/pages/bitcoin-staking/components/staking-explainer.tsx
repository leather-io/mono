import { type HTMLStyledProps } from 'leather-styles/jsx';
import { Explainer } from '~/components/explainer';
import { LearnHoverCard } from '~/components/learn-hover-card';
import { bitcoinStakingExplainer } from '~/content/bitcoin-staking-content';
import { learnArticles } from '~/content/learn-content';
import { sanitizeContent } from '~/utils/sanitize-content';

export function StakingExplainer(props: HTMLStyledProps<'section'>) {
  return (
    <Explainer {...props}>
      {bitcoinStakingExplainer.map((step, idx) => {
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
