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
  const { status, quoteAmount, isRefetching } = deriveEstimateSnapshot(liveEstimate);
  const shouldPulse = (status === 'loading' || !!isRefetching) && baseAmount !== '0';
  const pulsingStyle = usePulsingAnimation(shouldPulse);
  const { primaryAmount, secondaryAmount } = useStableTargetAmounts({
    baseAmount,
    status,
    nextQuoteAmount: quoteAmount,
    marketData,
  });

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

interface UseStableTargetAmountsParams {
  baseAmount: string;
  status: LiveSwapEstimate['status'];
  nextQuoteAmount?: Money;
  marketData?: MarketData;
}

interface StableTargetAmounts {
  primaryAmount?: Money;
  secondaryAmount?: Money;
}

function useStableTargetAmounts({
  baseAmount,
  status,
  nextQuoteAmount,
  marketData,
}: UseStableTargetAmountsParams): StableTargetAmounts {
  const lastStableAmounts = useRef<StableTargetAmounts>({
    primaryAmount: undefined,
    secondaryAmount: undefined,
  });
  const shouldReset = baseAmount === '0' || status === 'error' || status === 'empty';
  const shouldHoldLast = status === 'loading' || status === 'idle';

  if (shouldReset) {
    lastStableAmounts.current = { primaryAmount: undefined, secondaryAmount: undefined };
    return lastStableAmounts.current;
  }

  if (shouldHoldLast) {
    return lastStableAmounts.current;
  }

  const primaryAmount = nextQuoteAmount;
  const secondaryAmount = getSecondaryAmount(primaryAmount, marketData);
  lastStableAmounts.current = { primaryAmount, secondaryAmount };
  return lastStableAmounts.current;
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
  isRefetching?: boolean;
}

function deriveEstimateSnapshot(liveEstimate: LiveSwapEstimate): EstimateSnapshot {
  if (liveEstimate.status !== 'success') {
    return { status: liveEstimate.status };
  }

  return {
    status: 'success',
    quoteAmount: liveEstimate.selectedQuote?.quoteAmount,
    isRefetching: liveEstimate.isRefetching,
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
