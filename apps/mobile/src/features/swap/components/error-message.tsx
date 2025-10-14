import Animated, { withTiming } from 'react-native-reanimated';

import { isUserInputEffectivelyZero } from '@/features/swap/swap-state/utils/amount-operations';
import { BaseAmountIssue } from '@/features/swap/swap-state/validation/swap-validation';
import { formatCurrency } from '@/utils/currency-formatter';
import { t } from '@lingui/core/macro';

import { Box, Text } from '@leather.io/ui/native';
import { assertUnreachable } from '@leather.io/utils';

const AnimatedBox = Animated.createAnimatedComponent(Box);

function getErrorMessage(issue?: BaseAmountIssue): string | undefined {
  if (!issue) return undefined;

  switch (issue.code) {
    case 'REQUIRED':
      return t`Enter an amount`;
    case 'INVALID':
      return t`Invalid amount`;
    case 'PRECISION_INVALID': {
      const maxDecimals = issue.context.decimals;
      return t`Too many decimals (max ${maxDecimals})`;
    }
    case 'TOO_SMALL': {
      const formattedMinimum = formatCurrency(issue.context.minimum);
      return t`Amount below minimum (${formattedMinimum})`;
    }
    case 'TOO_LARGE': {
      const formattedMaximum = formatCurrency(issue.context.maximum);
      return t`Amount exceeds maximum (${formattedMaximum})`;
    }
    case 'INSUFFICIENT_BALANCE':
      return t`Insufficient balance`;
    default:
      return assertUnreachable(issue);
  }
}

interface ErrorMessageProps {
  amount: string;
  issue?: BaseAmountIssue;
}

export function ErrorMessage({ amount, issue }: ErrorMessageProps) {
  const errorMessage = getErrorMessage(issue);

  if (!errorMessage || isUserInputEffectivelyZero(amount)) {
    return null;
  }

  return (
    <AnimatedBox entering={enteringAnimation} exiting={exitingAnimation}>
      <Text
        mt="5"
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
