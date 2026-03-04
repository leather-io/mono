import { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { Divider } from '@/components/divider';
import { QuoteRefetchIndicator } from '@/features/swap/components/quote-refetch-indicator';
import { formatSwapRate, sumFeesInQuoteCurrency } from '@/features/swap/swap.utils';
import { formatCurrency } from '@/utils/currency-formatter';
import { t } from '@lingui/core/macro';

import { SwappableFungibleCryptoAsset } from '@leather.io/models';
import { LiveSwapEstimate } from '@leather.io/state/swap';
import { AnimatedBox, Box, Text } from '@leather.io/ui/native';

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

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isRefetching ? 0.5 : 1),
  }));

  return (
    <AnimatedBox p="4" style={animatedStyle}>
      <QuotePreviewRow
        label={t`Rate`}
        value={
          <>
            <QuoteRefetchIndicator
              interval={intervalState.interval}
              lastStartedAt={intervalState.lastStartedAt}
              nextRunTime={intervalState.nextRunTime}
            />
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
      <Text variant="label03" color="ink.text-subdued-secondary">
        {label}
      </Text>
      <Box flexDirection="row" alignItems="center" gap="2">
        {value}
      </Box>
    </Box>
  );
}
