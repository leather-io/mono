import { Flex, styled } from 'leather-styles/jsx';
import { HTMLStyledProps } from 'leather-styles/types';
import { Page } from '~/features/page/page';

interface ApyRewardHeroCardProps extends HTMLStyledProps<'div'> {
  apyRange: string;
}
export function ApyRewardHeroCard({ apyRange, ...props }: ApyRewardHeroCardProps) {
  return (
    <Page.Inset pos="relative" bg="black" color="white" h="280px" {...props}>
      <Flex flexDir="column" pos="absolute" bottom={0} p={['space.04', 'space.05', 'space.07']}>
        <PostValueHoverCard postKey="historical-yield" value="{apyRange}" />
      </Flex>
    </Page.Inset>
  );
}
