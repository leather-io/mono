import { useRef } from 'react';
import {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { LiveSwapEstimate } from '@/features/swap/hooks/use-live-swap-estimate';
import { formatCurrency } from '@/utils/currency-formatter';

import { MarketData, Money } from '@leather.io/models';
import { AnimatedBox, Box, Text } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

interface TargetAmountPreviewProps {
  marketData?: MarketData;
  liveEstimate: LiveSwapEstimate;
  baseAmount: string;
  isTargetAssetSet: boolean;
}

export function TargetAmountPreview({
  marketData,
  liveEstimate,
  baseAmount,
  isTargetAssetSet,
}: TargetAmountPreviewProps) {
  const { status, targetAmount, isRefetching = false } = deriveEstimateSnapshot(liveEstimate);
  const isPulsing = shouldPulse(status, isTargetAssetSet, isRefetching, baseAmount);
  const pulsingStyle = usePulsingAnimation(isPulsing);
  const { primaryAmount, secondaryAmount } = useStableTargetAmounts({
    baseAmount,
    status,
    targetAmount,
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
  targetAmount?: Money;
  marketData?: MarketData;
}

interface StableTargetAmounts {
  primaryAmount?: Money;
  secondaryAmount?: Money;
}

function useStableTargetAmounts({
  baseAmount,
  status,
  targetAmount,
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

  const primaryAmount = targetAmount;
  const secondaryAmount = getSecondaryAmount(primaryAmount, marketData);
  lastStableAmounts.current = { primaryAmount, secondaryAmount };
  return lastStableAmounts.current;
}

function usePulsingAnimation(enabled: boolean) {
  const duration = 350;
  const easing = Easing.inOut(Easing.cubic);
  const opacity = useDerivedValue(() => {
    if (!enabled) return withTiming(1, { duration, easing });

    return withRepeat(
      withSequence(
        withTiming(0.6, {
          duration,
          easing,
        }),
        withTiming(0.85, {
          duration,
          easing,
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
  targetAmount?: Money;
  isRefetching?: boolean;
}

function deriveEstimateSnapshot(liveEstimate: LiveSwapEstimate): EstimateSnapshot {
  if (liveEstimate.status !== 'success') {
    return { status: liveEstimate.status };
  }

  return {
    status: 'success',
    targetAmount: liveEstimate.selectedQuote?.targetAmount,
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

function shouldPulse(
  status: LiveSwapEstimate['status'],
  isTargetAssetSet: boolean,
  isRefetching: boolean,
  baseAmount: string
): boolean {
  // Pulse only when amount and target asset, to avoid even slight transitions when form is reset.
  // `idle` helps start pulsing instantly while in debounce window for quote fetching.
  return (
    isTargetAssetSet &&
    baseAmount !== '0' &&
    (status === 'loading' || status === 'idle' || isRefetching)
  );
}
