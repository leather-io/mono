import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { Flex, type FlexProps, styled } from 'leather-styles/jsx';

interface SecretKeyWordProps extends FlexProps {
  word: string;
  num: number;
}
export function SecretKeyWord({ word, num }: SecretKeyWordProps) {
  return (
    <Flex
      height="2.75rem"
      width="100%"
      gap="space.01"
      px="space.03"
      bg="ink.component-background-default"
      borderRadius="xs"
      borderWidth={1}
      borderColor="ink.border-default"
      alignItems="center"
    >
      <styled.span width={20} color="ink.text-non-interactive">
        {num}.
      </styled.span>
      <styled.span color="ink.text-primary" data-testid={OnboardingSelectors.SecretKey}>
        {word}
      </styled.span>
    </Flex>
  );
}
