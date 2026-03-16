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
import { Trans } from '@lingui/react/macro';
import * as Linking from 'expo-linking';

import { LEATHER_SUPPORT_URL } from '@leather.io/constants';
import { Money, SwappableFungibleCryptoAsset } from '@leather.io/models';
import {
  AnimatedBox,
  ArrowLeftIcon,
  Box,
  Button,
  CheckmarkCircleIcon,
  ErrorCircleIcon,
  Text,
  useOnMount,
} from '@leather.io/ui/native';

const overlayEnteringAnimationDuration = 300;
const summaryAnimationTravelDistance = 120;

interface SwapSubmissionOverlayProps {
  baseAsset: SwappableFungibleCryptoAsset;
  targetAsset: SwappableFungibleCryptoAsset;
  baseAmount: Money;
  targetAmount: Money;
  status: 'submitting' | 'success' | 'failure';
  onReset(): void;
}

export function SwapSubmissionOverlay({
  baseAmount,
  baseAsset,
  targetAmount,
  targetAsset,
  status,
  onReset,
}: SwapSubmissionOverlayProps) {
  const {
    startEnteringAnimation,
    summaryAnimationStyle,
    statusAnimationStyle,
    messageAnimationStyle,
  } = useSwapSubmissionOverlayAnimation();

  useOnMount(() => {
    startEnteringAnimation();
  });

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
          <SubmissionStatusDisplay status={status} />
        </AnimatedBox>

        <AnimatedBox alignItems="center" gap="3" style={[messageAnimationStyle]}>
          <SubmissionStatusMessage status={status} />
          {status === 'failure' && <SubmissionFailureMessage onReset={onReset} />}
        </AnimatedBox>
      </Box>
    </AnimatedBox>
  );
}

interface SubmissionStatusMessageProps {
  status: 'submitting' | 'success' | 'failure';
}

function SubmissionStatusMessage({ status }: SubmissionStatusMessageProps) {
  const message = {
    submitting: t`Initiating the swap...`,
    success: t`Swap initiated`,
    failure: t`Failed to start a swap`,
  };

  return (
    <AnimatedBox>
      <Text variant="label01">{message[status]}</Text>
    </AnimatedBox>
  );
}

interface SubmissionStatusDisplayProps {
  status: 'submitting' | 'success' | 'failure';
}

function SubmissionStatusDisplay({ status }: SubmissionStatusDisplayProps) {
  const render = {
    submitting: <SpinnerIcon width={24} height={24} />,
    success: <CheckmarkCircleIcon variant="medium" color="green.action-primary-default" />,
    failure: <ErrorCircleIcon variant="medium" color="red.action-primary-default" />,
  };

  return <AnimatedBox>{render[status]}</AnimatedBox>;
}

interface SubmissionFailureMessageProps {
  onReset(): void;
}

function SubmissionFailureMessage({ onReset }: SubmissionFailureMessageProps) {
  return (
    <Box alignItems="center" gap="5" px="5">
      <Text variant="body02" color="ink.text-subdued-primary" textAlign="center" lineHeight={24}>
        <Trans>
          Swap wasn't submitted due to an unexpected error. Please try again, or{' '}
          <Text
            variant="body02"
            color="ink.text-subdued-primary"
            onPress={() => Linking.openURL(LEATHER_SUPPORT_URL)}
            textDecorationLine="underline"
            textDecorationStyle="solid"
          >
            contact support
          </Text>{' '}
          if it persists.
        </Trans>
      </Text>
      <Button size="sm" variant="outline" iconStart={ArrowLeftIcon} onPress={onReset}>
        {t`Back to review`}
      </Button>
    </Box>
  );
}

function useSwapSubmissionOverlayAnimation() {
  const summaryPosition = useSharedValue(0);
  const statusOpacity = useSharedValue(0);
  const messageOpacity = useSharedValue(0);

  function startEnteringAnimation() {
    'worklet';
    summaryPosition.value = withDelay(
      overlayEnteringAnimationDuration,
      withSpring(summaryAnimationTravelDistance, { duration: 700, dampingRatio: 0.85 })
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
