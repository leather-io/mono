import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { SwapQuoteSelectionResult } from '@/features/swap/swap-state/swap-state.types';
import { formatCurrency } from '@/utils/currency-formatter';
import { UseQueryResult } from '@tanstack/react-query';

import { Box, SkeletonLoader, Text } from '@leather.io/ui/native';

interface TargetAmountPreviewProps {
  quoteQuery: UseQueryResult<SwapQuoteSelectionResult>;
  baseAmount: string;
}

export function TargetAmountPreview({ quoteQuery, baseAmount }: TargetAmountPreviewProps) {
  const animatedStyle = usePulsingAnimation(quoteQuery.isRefetching);

  if (quoteQuery.isLoading) return <LoadingIndicator />;

  const hasNonZeroBaseAmount = Number(baseAmount) !== 0;

  if (quoteQuery.isSuccess && quoteQuery.data.selected && hasNonZeroBaseAmount) {
    return (
      <Animated.View style={animatedStyle}>
        <Amount
          value={formatCurrency(quoteQuery.data.selected.quoteAmount, {
            showCurrency: false,
            compactThreshold: 10_000_000,
          })}
        />
      </Animated.View>
    );
  }

  return <Amount value="0" />;
}

function LoadingIndicator() {
  return (
    <Box width={120} height={36} justifyContent="center">
      <Box height={24}>
        <SkeletonLoader isLoading />
      </Box>
    </Box>
  );
}

function Amount({ value }: { value: string }) {
  return (
    <Text
      variant="heading02"
      fontSize={24}
      lineHeight={36}
      style={{ paddingTop: 1, marginBottom: -1 }}
      color={value === '0' ? 'ink.text-subdued' : 'ink.text-primary'}
    >
      {value}
    </Text>
  );
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
