import Animated, { withTiming } from 'react-native-reanimated';

import { isUserInputEffectivelyZero } from '@/features/send/utils';

import { Box, Text } from '@leather.io/ui/native';

const AnimatedBox = Animated.createAnimatedComponent(Box);

interface ErrorMessageProps {
  amount: string;
  errorMessage: string | undefined;
}

export function ErrorMessage({ amount, errorMessage }: ErrorMessageProps) {
  if (!errorMessage || isUserInputEffectivelyZero(amount)) {
    return null;
  }

  return (
    <AnimatedBox entering={enteringAnimation} exiting={exitingAnimation}>
      <Text
        mt="3"
        textAlign="center"
        variant="label02"
        color="red.action-primary-default"
        accessibilityLiveRegion="polite"
      >
        {errorMessage}
      </Text>
    </AnimatedBox>
  );
}

function enteringAnimation() {
  'worklet';
  return {
    initialValues: {
      opacity: 0,
      transform: [{ translateY: -3 }],
    },
    animations: {
      opacity: withTiming(1, { duration: 240 }),
      transform: [{ translateY: withTiming(0, { duration: 240 }) }],
    },
  };
}

function exitingAnimation() {
  'worklet';
  return {
    initialValues: {
      opacity: 1,
      transform: [{ translateY: 0 }],
    },
    animations: {
      opacity: withTiming(0, { duration: 240 }),
      transform: [{ translateY: withTiming(-3, { duration: 240 }) }],
    },
  };
}
