import { useEffect } from 'react';
import {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { SpinnerIcon } from '@/components/spinner-icon';
import { SwapReviewSummary } from '@/features/swap/components/review/swap-review-summary';
import { HEADER_HEIGHT } from '@/shared/constants';
import { t } from '@lingui/core/macro';

import { Money, SwappableFungibleCryptoAsset } from '@leather.io/models';
import {
  AnimatedBox,
  Box,
  CheckmarkCircleIcon,
  ErrorCircleIcon,
  Text,
} from '@leather.io/ui/native';

const overlayEnteringAnimationDuration = 300;
const summaryAnimationTravelDistance = 120;

interface SwapExecutionOverlayProps {
  baseAsset: SwappableFungibleCryptoAsset;
  targetAsset: SwappableFungibleCryptoAsset;
  baseAmount: Money;
  targetAmount: Money;
  status: 'executing' | 'success' | 'failure';
}

export function SwapExecutionOverlay({
  baseAmount,
  baseAsset,
  targetAmount,
  targetAsset,
  status,
}: SwapExecutionOverlayProps) {
  const {
    startEnteringAnimation,
    summaryAnimationStyle,
    statusAnimationStyle,
    messageAnimationStyle,
  } = useSwapExecutionOverlayAnimation();

  useEffect(() => {
    startEnteringAnimation();
  }, [startEnteringAnimation]);

  return (
    <AnimatedBox
      zIndex="20"
      position="absolute"
      top={-HEADER_HEIGHT}
      right={0}
      bottom={0}
      left={0}
      bg="ink.background-primary"
      entering={FadeIn.duration(overlayEnteringAnimationDuration)}
    >
      <Box
        style={{
          marginTop: HEADER_HEIGHT,
          paddingBottom: summaryAnimationTravelDistance,
          marginBottom: 36,
        }}
      >
        <AnimatedBox style={[summaryAnimationStyle]}>
          <SwapReviewSummary
            baseAsset={baseAsset}
            targetAsset={targetAsset}
            baseAmount={baseAmount}
            targetAmount={targetAmount}
          />
        </AnimatedBox>
      </Box>

      <Box gap="3">
        <AnimatedBox alignItems="center" style={[statusAnimationStyle]}>
          <ExecutionStatusDisplay status={status} />
        </AnimatedBox>

        <AnimatedBox alignItems="center" style={[messageAnimationStyle]}>
          <ExecutionStatusMessage status={status} />
        </AnimatedBox>
      </Box>
    </AnimatedBox>
  );
}

interface ExecutionStatusMessageProps {
  status: 'executing' | 'success' | 'failure';
}

function ExecutionStatusMessage({ status }: ExecutionStatusMessageProps) {
  const message = {
    executing: t`Initiating the swap...`,
    success: t`Swap initiated`,
    failure: t`Failed to start a swap`,
  };

  return (
    <AnimatedBox>
      <Text variant="label01">{message[status]}</Text>
    </AnimatedBox>
  );
}

interface ExecutionStatusProps {
  status: 'executing' | 'success' | 'failure';
}

function ExecutionStatusDisplay({ status }: ExecutionStatusProps) {
  const render = {
    executing: <SpinnerIcon width={24} height={24} />,
    success: <CheckmarkCircleIcon variant="medium" color="green.action-primary-default" />,
    failure: <ErrorCircleIcon variant="medium" color="red.action-primary-default" />,
  };

  return <AnimatedBox>{render[status]}</AnimatedBox>;
}

function useSwapExecutionOverlayAnimation() {
  const summaryPosition = useSharedValue(0);
  const statusOpacity = useSharedValue(0);
  const messageOpacity = useSharedValue(0);

  function startEnteringAnimation() {
    'worklet';
    summaryPosition.value = withDelay(
      overlayEnteringAnimationDuration,
      withSpring(summaryAnimationTravelDistance, { duration: 1100, dampingRatio: 0.8 })
    );
    statusOpacity.value = withDelay(420, withTiming(1, { duration: 300 }));
    messageOpacity.value = withDelay(520, withTiming(1, { duration: 300 }));
  }

  const summaryAnimationStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: summaryPosition.value }],
  }));

  const statusAnimationStyle = useAnimatedStyle(() => ({
    opacity: statusOpacity.value,
  }));

  const messageAnimationStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
  }));

  return {
    startEnteringAnimation,
    summaryAnimationStyle,
    statusAnimationStyle,
    messageAnimationStyle,
  };
}
