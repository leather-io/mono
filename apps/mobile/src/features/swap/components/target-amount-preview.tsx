import { useRef } from 'react';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { SwapQuoteSelectionResult } from '@/features/swap/swap-state/swap-state.types';
import { formatCurrency } from '@/utils/currency-formatter';
import { UseQueryResult } from '@tanstack/react-query';

import { Money } from '@leather.io/models';
import { Text } from '@leather.io/ui/native';

interface TargetAmountPreviewProps {
  quoteQuery: UseQueryResult<SwapQuoteSelectionResult>;
  baseAmount: string;
}

export function TargetAmountPreview({ quoteQuery, baseAmount }: TargetAmountPreviewProps) {
  const { displayAmount } = useDisplayAmount({ baseAmount, quoteQuery });
  const animatedStyle = usePulsingAnimation(quoteQuery.isFetching);
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
  quoteQuery: UseQueryResult<SwapQuoteSelectionResult>;
}

// Ensure minimal transitions of target amount as user edits base amount:
// 1. Don't reset when the base amount is effectively 0 but likely in flight, e.g., 0.0000
// 2. Maintain the previous target amount while a new quote is being fetched.
function useDisplayAmount({ baseAmount, quoteQuery }: UseDisplayAmountParams) {
  const lastStableQuoteAmount = useRef<Money | null>(null);
  const currentQuoteAmount = quoteQuery.data?.selected?.quoteAmount;

  if (baseAmount === '0') {
    lastStableQuoteAmount.current = null;
    return { displayAmount: null };
  }

  if (!quoteQuery.isFetching && currentQuoteAmount !== undefined) {
    lastStableQuoteAmount.current = currentQuoteAmount ?? null;
  }

  return { displayAmount: currentQuoteAmount ?? lastStableQuoteAmount.current };
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
