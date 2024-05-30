import { Flex, FlexProps, styled } from 'leather-styles/jsx';

import { OnboardingSelectors } from '../../tmp/tests/selectors/onboarding.selectors';

interface SecretKeyWordProps extends FlexProps {
  word: string;
  num: number;
}
export function SecretKeyWord({ word, num }: SecretKeyWordProps) {
  return (
    <Flex
      height="3rem"
      width="100%"
      gap="space.01"
      px="space.03"
      bg="ink.component-background-default"
      borderRadius="xs"
    >
      <styled.span display="flex" alignItems="center" mr="space.01" color="ink.text-subdued">
        {num}.
      </styled.span>
      <styled.span
        display="flex"
        alignItems="center"
        color="ink.text-primary"
        data-testid={OnboardingSelectors.SecretKey}
      >
        {word}
      </styled.span>
    </Flex>
  );
}
