import Animated, { LayoutAnimation, withSpring, withTiming } from 'react-native-reanimated';

import {
  AmountField as RawAmountField,
  type AmountFieldProps as RawAmountFieldProps,
} from '@/components/amount-field/amount-field';
import { FieldConnectorArrow } from '@/features/send/components/field-connector-arrow';

import { Box } from '@leather.io/ui/native';

interface AmountFieldProps extends RawAmountFieldProps {
  enteringAnimationEnabled?: boolean;
}

export function AmountField({ enteringAnimationEnabled, ...amountFieldProps }: AmountFieldProps) {
  return (
    <AnimatedBox
      zIndex="10"
      mt="-3"
      entering={enteringAnimationEnabled ? enteringAnimation : undefined}
      backgroundColor="ink.background-primary"
    >
      <RawAmountField {...amountFieldProps} />
      <FieldConnectorArrow />
    </AnimatedBox>
  );
}

const AnimatedBox = Animated.createAnimatedComponent(Box);

function enteringAnimation(): LayoutAnimation {
  'worklet';

  return {
    initialValues: {
      opacity: 0,
      transform: [{ translateY: -100 }],
    },
    animations: {
      opacity: withTiming(1),
      transform: [
        {
          translateY: withSpring(0, { mass: 0.1, damping: 20, stiffness: 100 }),
        },
      ],
    },
  };
}
