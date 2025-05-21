import { Flex, styled } from 'leather-styles/jsx';
import { HTMLStyledProps } from 'leather-styles/types';
import { Page } from '~/features/page/page';
import { PostValueHoverCard } from '~/components/post-value-hover-card';
import { getPosts } from '~/utils/post-utils';

interface ApyRewardHeroCardProps extends HTMLStyledProps<'div'> {
  apyRange: string;
}
export function ApyRewardHeroCard({ apyRange, ...props }: ApyRewardHeroCardProps) {
  const posts = getPosts();
  const post = posts.historicalYield;
  
  return (
    <Page.Inset pos="relative" bg="black" color="white" h="280px" {...props}>
      <Flex flexDir="column" pos="absolute" bottom={0} p={['space.04', 'space.05', 'space.07']}>
        <PostValueHoverCard post={post} value={apyRange} />
      </Flex>
    </Page.Inset>
  );
}
