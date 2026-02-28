import { useLayoutEffect } from 'react';

import { type MotionStyle, animate, motion, useMotionValue } from 'framer-motion';
import { Divider, Flex, styled } from 'leather-styles/jsx';

import { SwappableFungibleCryptoAsset } from '@leather.io/models';
import { LiveSwapEstimate } from '@leather.io/state/swap';

import { formatCurrency } from '@app/common/currency-formatter';
import { formatSwapRate, sumFeesInQuoteCurrency } from '@app/pages/swap/swap-utils';

import { QuoteRefetchIndicator } from './quote-refetch-indicator';

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
  const refetchStyle = useRefetchDimming(isRefetching);

  return (
    <motion.div style={refetchStyle}>
      <Flex px="space.04" direction="column">
        <QuotePreviewRow
          label="Rate"
          value={
            <Flex alignItems="center" gap="space.02">
              <QuoteRefetchIndicator
                interval={intervalState.interval}
                lastStartedAt={intervalState.lastStartedAt}
                nextRunTime={intervalState.nextRunTime}
              />
              <styled.span textStyle="label.03">{formattedRate}</styled.span>
            </Flex>
          }
        />
        <Divider borderColor="ink.border-transparent" />
        <QuotePreviewRow
          label="Estimated fees"
          value={<styled.span textStyle="label.03">{formatCurrency(totalFees)}</styled.span>}
        />
      </Flex>
    </motion.div>
  );
}

interface QuotePreviewRowProps {
  label: string;
  value: React.ReactNode;
}

function QuotePreviewRow({ label, value }: QuotePreviewRowProps) {
  return (
    <Flex h="40px" alignItems="center" justifyContent="space-between">
      <styled.span textStyle="label.03" color="ink.text-subdued">
        {label}
      </styled.span>
      <Flex alignItems="center" gap="space.02">
        {value}
      </Flex>
    </Flex>
  );
}

function useRefetchDimming(isRefetching: boolean): MotionStyle {
  const opacity = useMotionValue(1);

  useLayoutEffect(() => {
    const controls = animate(opacity, isRefetching ? 0.5 : 1, {
      duration: 0.3,
      ease: 'easeInOut',
    });
    return () => controls.stop();
  }, [isRefetching, opacity]);

  return { opacity };
}
