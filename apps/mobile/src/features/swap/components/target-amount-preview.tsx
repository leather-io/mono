import { useRef } from 'react';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { formatCurrency } from '@/utils/currency-formatter';

import { MarketData, Money } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

interface TargetAmountPreviewProps {
  marketData?: MarketData;
  targetAmount?: Money;
  isLoading: boolean;
  baseAmount: string;
}

export function TargetAmountPreview({
  marketData,
  targetAmount,
  isLoading,
  baseAmount,
}: TargetAmountPreviewProps) {
  const displayAmount = useDisplayAmount({ baseAmount, targetAmount, isLoading });
  const animatedStyle = usePulsingAnimation(isLoading && baseAmount !== '0');
  const formattedAmount = formatAmount(displayAmount);
  const secondaryAmount = calculateQuoteCurrencyAmount(displayAmount, marketData);

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
      <SecondaryAmountPreview amount={secondaryAmount} />
    </Animated.View>
  );
}

interface SecondaryAmountPreviewProps {
  amount?: Money;
}

function SecondaryAmountPreview({ amount }: SecondaryAmountPreviewProps) {
  return (
    <Box mt="2" height={20}>
      {amount && (
        <Text variant="label02" color="ink.text-subdued">
          {formatCurrency(amount)}
        </Text>
      )}
    </Box>
  );
}

interface UseDisplayAmountParams {
  baseAmount: string;
  targetAmount?: Money;
  isLoading: boolean;
}

// Ensure minimal transitions of target amount as user edits base amount:
// 1. Don't reset when the base amount is effectively 0 but likely in flight, e.g., 0.0000
// 2. Maintain the previous target amount while a new quote is being fetched.
function useDisplayAmount({ baseAmount, targetAmount, isLoading }: UseDisplayAmountParams) {
  const lastStableQuoteAmount = useRef<Money>(undefined);

  if (baseAmount === '0') {
    lastStableQuoteAmount.current = undefined;
    return;
  }

  if (isLoading) return lastStableQuoteAmount.current;

  lastStableQuoteAmount.current = targetAmount;

  return targetAmount ?? lastStableQuoteAmount.current;
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

function calculateQuoteCurrencyAmount(displayAmount?: Money, marketData?: MarketData) {
  if (!marketData) return;

  if (!displayAmount) {
    return createMoney(0, marketData.price.symbol, marketData.price.decimals);
  }

  return baseCurrencyAmountInQuote(displayAmount, marketData);
}

function formatAmount(amount?: Money): string {
  if (!amount) return '0';
  return formatCurrency(amount, { showCurrency: false, compactThreshold: 1_000_000 });
}
