import { Flex } from 'leather-styles/jsx';
import { HTMLStyledProps } from 'leather-styles/types';
import { ValueHoverCard } from '~/components/value-hover-card';
import { learnArticles } from '~/content/learn-content';
import { Page } from '~/layouts/page/page';

interface ApyRewardHeroCardProps extends HTMLStyledProps<'div'> {
  apyRange: string;
}
export function ApyRewardHeroCard({ apyRange, ...props }: ApyRewardHeroCardProps) {
  const article = learnArticles.historicalYield;

  return (
    <Page.Inset pos="relative" bg="black" color="white" h="280px" {...props}>
      <Flex flexDir="column" pos="absolute" bottom={0} p={['space.04', 'space.05', 'space.07']}>
        <ValueHoverCard label={article.title} value={apyRange} article={article} />
      </Flex>
    </Page.Inset>
  );
}
