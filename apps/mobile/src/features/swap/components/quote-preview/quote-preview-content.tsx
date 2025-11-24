import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { Divider } from '@/components/divider';
import { LiveSwapEstimate } from '@/features/swap/hooks/use-live-swap-estimate';
import { formatSwapRate, sumFeesInQuoteCurrency } from '@/features/swap/swap.utils';
import { formatCurrency } from '@/utils/currency-formatter';
import { t } from '@lingui/core/macro';
import { clamp } from 'remeda';

import { SwappableFungibleCryptoAsset } from '@leather.io/models';
import { Box, CircularProgress, Text, useTheme } from '@leather.io/ui/native';

const AnimatedBox = Animated.createAnimatedComponent(Box);

interface QuotePreviewContentProps {
  baseAsset: SwappableFungibleCryptoAsset;
  targetAsset: SwappableFungibleCryptoAsset;
  liveEstimate: Extract<LiveSwapEstimate, { status: 'success' }>;
}

export function QuotePreviewContent({
  baseAsset,
  targetAsset,
  liveEstimate,
}: QuotePreviewContentProps) {
  const { selectedQuote, fees, intervalState, isRefetching } = liveEstimate;
  const formattedRate = formatSwapRate({
    swapRate: selectedQuote.swapRate,
    baseAsset,
    targetAsset,
  });
  const totalFees = sumFeesInQuoteCurrency(fees.network.quote, fees.provider?.quote);
  const progress = calculateRefreshProgress(intervalState.interval, intervalState.lastStartedAt);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isRefetching ? 0.5 : 1),
  }));

  return (
    <AnimatedBox p="4" style={animatedStyle}>
      <QuotePreviewRow
        label={t`Rate`}
        value={
          <>
            <RefetchIndicator progress={progress} nextRunTime={intervalState.nextRunTime} />
            <Text variant="label03">{formattedRate}</Text>
          </>
        }
      />
      <Divider />
      <QuotePreviewRow
        label={t`Estimated fees`}
        value={<Text variant="label03">{formatCurrency(totalFees)}</Text>}
      />
    </AnimatedBox>
  );
}

interface QuotePreviewRowProps {
  label: string;
  value: React.ReactNode;
}

function QuotePreviewRow({ label, value }: QuotePreviewRowProps) {
  return (
    <Box height={40} flexDirection="row" alignItems="center" justifyContent="space-between">
      <Text variant="label03" color="ink.text-subdued">
        {label}
      </Text>
      <Box flexDirection="row" alignItems="center" gap="2">
        {value}
      </Box>
    </Box>
  );
}

interface RefetchIndicatorProps {
  progress: RefetchProgress;
  nextRunTime: number | null;
}

function RefetchIndicator({ progress, nextRunTime }: RefetchIndicatorProps) {
  const theme = useTheme();

  return (
    <CircularProgress
      size={12}
      strokeWidth={1.5}
      progress={1}
      initialValue={progress.initialValue}
      duration={progress.duration}
      max={1}
      activeStrokeColor={theme.colors['ink.text-subdued']}
      key={nextRunTime}
    />
  );
}

interface RefetchProgress {
  initialValue: number;
  duration: number;
}

function calculateRefreshProgress(interval: number, lastStartedAt: number | null): RefetchProgress {
  const elapsed = lastStartedAt ? Date.now() - lastStartedAt : 0;
  const initialValue = clamp(elapsed / interval, { min: 0, max: 1 });
  const remaining = Math.max(interval - elapsed, 0);
  const duration = remaining || interval;

  return { initialValue, duration };
}
