import { useRef } from 'react';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { LiveSwapEstimate } from '@/features/swap/hooks/use-live-swap-estimate';
import { formatCurrency } from '@/utils/currency-formatter';

import { MarketData, Money } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

const AnimatedBox = Animated.createAnimatedComponent(Box);

interface TargetAmountPreviewProps {
  marketData?: MarketData;
  liveEstimate: LiveSwapEstimate;
  baseAmount: string;
}

export function TargetAmountPreview({
  marketData,
  liveEstimate,
  baseAmount,
}: TargetAmountPreviewProps) {
  const { status, quoteAmount } = deriveEstimateSnapshot(liveEstimate);
  const shouldPulse = status === 'loading' && baseAmount !== '0';
  const pulsingStyle = usePulsingAnimation(shouldPulse);
  const primaryAmount = useStableTargetAmount({
    baseAmount,
    status,
    nextQuoteAmount: quoteAmount,
  });
  const secondaryAmount = getSecondaryAmount(primaryAmount, marketData);

  return (
    <AnimatedBox style={pulsingStyle} gap="3">
      <Text
        fontFamily="MarchePro-Super"
        fontSize={24}
        lineHeight={32}
        style={{ paddingTop: 1, marginBottom: -1 }}
        color={getTargetAmountTextColor(primaryAmount)}
      >
        {formatPrimaryAmount(primaryAmount)}
      </Text>
      <Box height={16}>
        {secondaryAmount && (
          <Text variant="label03" color="ink.text-subdued">
            {formatCurrency(secondaryAmount)}
          </Text>
        )}
      </Box>
    </AnimatedBox>
  );
}

interface UseStableTargetAmountParams {
  baseAmount: string;
  status: LiveSwapEstimate['status'];
  nextQuoteAmount?: Money;
}

// Ensure minimal transitions of target amount as user edits base amount:
// 1. Don't reset when the base amount is effectively 0 but likely in flight, e.g., 0.0000
// 2. Maintain the previous target amount while a new quote is being fetched.
function useStableTargetAmount({
  baseAmount,
  status,
  nextQuoteAmount,
}: UseStableTargetAmountParams) {
  const lastStableTargetAmount = useRef<Money | undefined>(undefined);
  const shouldReset = baseAmount === '0' || status === 'error' || status === 'empty';
  const shouldHoldLast = status === 'loading' || status === 'idle';

  if (shouldReset) {
    lastStableTargetAmount.current = undefined;
    return undefined;
  }

  if (shouldHoldLast) {
    return lastStableTargetAmount.current;
  }

  lastStableTargetAmount.current = nextQuoteAmount;
  return nextQuoteAmount;
}

function usePulsingAnimation(enabled: boolean) {
  const opacity = useDerivedValue(() => {
    if (!enabled) return 1;

    return withRepeat(
      withSequence(
        withTiming(0.5, {
          duration: 500,
        }),
        withTiming(1, {
          duration: 500,
        })
      ),
      -1,
      true
    );
  }, [enabled]);

  return useAnimatedStyle(() => ({ opacity: opacity.value }));
}

interface EstimateSnapshot {
  status: LiveSwapEstimate['status'];
  quoteAmount?: Money;
}

function deriveEstimateSnapshot(liveEstimate: LiveSwapEstimate): EstimateSnapshot {
  if (liveEstimate.status !== 'success') {
    return { status: liveEstimate.status };
  }

  return {
    status: 'success',
    quoteAmount: liveEstimate.selectedQuote.quoteAmount,
  };
}

function getSecondaryAmount(primaryAmount?: Money, marketData?: MarketData) {
  if (!marketData) return undefined;

  if (!primaryAmount) {
    return createMoney(0, marketData.price.symbol, marketData.price.decimals);
  }

  return baseCurrencyAmountInQuote(primaryAmount, marketData);
}

function getTargetAmountTextColor(amount?: Money) {
  if (!amount || amount.amount.isZero()) {
    return 'ink.text-subdued';
  }
  return 'ink.text-primary';
}

function formatPrimaryAmount(amount?: Money): string {
  if (!amount) return '0';

  return formatCurrency(amount, {
    showCurrency: false,
    compactThreshold: 1_000_000,
  });
}
