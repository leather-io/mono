import { Flex, styled } from 'leather-styles/jsx';
import { HTMLStyledProps } from 'leather-styles/types';
import { Page } from '~/features/page/page';

interface ApyRewardHeroCardProps extends HTMLStyledProps<'div'> {
  apyRange: string;
}
export function ApyRewardHeroCard({ apyRange, ...props }: ApyRewardHeroCardProps) {
  return (
    <Page.Inset pos="relative" bg="black" color="white" h="260px" {...props}>
      <Flex flexDir="column" pos="absolute" bottom={0} p={['space.04', 'space.05', 'space.07']}>
        <styled.span textStyle="label.01">Historical APY</styled.span>
        <styled.span textStyle="heading.02">{apyRange}</styled.span>
      </Flex>
    </Page.Inset>
  );
}
