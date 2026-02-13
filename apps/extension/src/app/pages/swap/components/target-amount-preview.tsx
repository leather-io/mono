import { useLayoutEffect, useRef } from 'react';

import { type MotionStyle, animate, motion, useMotionValue } from 'framer-motion';
import { Box, Flex, styled } from 'leather-styles/jsx';

import { MarketData, Money } from '@leather.io/models';
import { LiveSwapEstimate } from '@leather.io/state/swap';
import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';

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
    <MotionFlex style={pulsingStyle} direction="column" gap="space.03">
      <styled.span
        textStyle="heading.03"
        fontSize={26}
        lineHeight="32px"
        color={getTargetAmountTextColor(primaryAmount)}
      >
        {formatPrimaryAmount(primaryAmount)}
      </styled.span>
      <Box height="16px">
        {secondaryAmount && (
          <styled.span textStyle="label.03" color="ink.text-subdued">
            {formatCurrency(secondaryAmount)}
          </styled.span>
        )}
      </Box>
    </MotionFlex>
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
  const shouldReset =
    baseAmount === '0' || status === 'error' || status === 'empty' || status === 'constrained';
  const shouldHoldLast = status === 'loading' || status === 'idle';

  if (shouldReset) {
    lastStableAmounts.current = { primaryAmount: undefined, secondaryAmount: undefined };
    return lastStableAmounts.current;
  }

  if (shouldHoldLast) {
    return lastStableAmounts.current;
  }

  const primary = targetAmount;
  const secondary = getSecondaryAmount(primary, marketData);
  lastStableAmounts.current = { primaryAmount: primary, secondaryAmount: secondary };
  return lastStableAmounts.current;
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
  return (
    isTargetAssetSet &&
    baseAmount !== '0' &&
    (status === 'loading' || status === 'idle' || isRefetching)
  );
}

const MotionFlex = motion.create(Flex);

const cubicInOut: [number, number, number, number] = [0.65, 0, 0.35, 1];

function usePulsingAnimation(enabled: boolean): MotionStyle {
  const opacity = useMotionValue(1);

  useLayoutEffect(() => {
    const controls = enabled
      ? animate(opacity, [0.85, 0.6, 0.85], {
          duration: 0.7,
          repeat: Infinity,
          ease: cubicInOut,
        })
      : animate(opacity, 1, {
          duration: 0.35,
          ease: cubicInOut,
        });

    return () => controls.stop();
  }, [enabled, opacity]);

  return { opacity };
}
