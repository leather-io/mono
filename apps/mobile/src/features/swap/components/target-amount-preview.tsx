import { useRef } from 'react';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { formatCurrency } from '@/utils/currency-formatter';

import { Money } from '@leather.io/models';
import { Text } from '@leather.io/ui/native';

interface TargetAmountPreviewProps {
  targetAmount: Money | undefined;
  isLoading: boolean;
  baseAmount: string;
}

export function TargetAmountPreview({
  targetAmount,
  isLoading,
  baseAmount,
}: TargetAmountPreviewProps) {
  const { displayAmount } = useDisplayAmount({ baseAmount, targetAmount, isLoading });
  const animatedStyle = usePulsingAnimation(isLoading && baseAmount !== '0');
  const formattedAmount = formatAmount(displayAmount);

  return (
    <Animated.View style={animatedStyle}>
      <Text
        variant="heading02"
        fontSize={24}
        lineHeight={36}
        style={{ paddingTop: 1, marginBottom: -1 }}
        color={formattedAmount === '0' ? 'ink.text-subdued' : 'ink.text-primary'}
      >
        {formattedAmount}
      </Text>
    </Animated.View>
  );
}

interface UseDisplayAmountParams {
  baseAmount: string;
  targetAmount: Money | undefined;
  isLoading: boolean;
}

// Ensure minimal transitions of target amount as user edits base amount:
// 1. Don't reset when the base amount is effectively 0 but likely in flight, e.g., 0.0000
// 2. Maintain the previous target amount while a new quote is being fetched.
function useDisplayAmount({ baseAmount, targetAmount, isLoading }: UseDisplayAmountParams) {
  const lastStableQuoteAmount = useRef<Money | null>(null);

  if (baseAmount === '0') {
    lastStableQuoteAmount.current = null;
    return { displayAmount: null };
  }

  if (isLoading) {
    return { displayAmount: lastStableQuoteAmount.current };
  }

  if (targetAmount !== undefined) {
    lastStableQuoteAmount.current = targetAmount;
  }

  return { displayAmount: targetAmount ?? lastStableQuoteAmount.current };
}

function formatAmount(amount: Money | null): string {
  if (!amount) return '0';
  return formatCurrency(amount, { showCurrency: false, compactThreshold: 1_000_000 });
}

function usePulsingAnimation(enabled: boolean) {
  const opacity = useDerivedValue(() => {
    if (enabled) {
      return withRepeat(
        withSequence(withTiming(0.5, { duration: 500 }), withTiming(1, { duration: 500 })),
        -1,
        true
      );
    }
    return 1;
  }, [enabled]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
}
