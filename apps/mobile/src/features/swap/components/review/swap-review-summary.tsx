import { formatCurrency } from '@/utils/currency-formatter';

import { Money, SwappableFungibleCryptoAsset } from '@leather.io/models';
import { AssetAvatarIcon, Box, Text } from '@leather.io/ui/native';

const summaryTextProps = {
  variant: 'heading03',
  textTransform: 'none',
  fontSize: 20,
  lineHeight: 24,
  padding: '0',
  margin: '0',
} as const;

interface SwapReviewSummaryProps {
  baseAsset: SwappableFungibleCryptoAsset;
  targetAsset: SwappableFungibleCryptoAsset;
  baseAmount: Money;
  targetAmount: Money;
}

export function SwapReviewSummary({
  baseAsset,
  targetAsset,
  baseAmount,
  targetAmount,
}: SwapReviewSummaryProps) {
  return (
    <Box gap="3">
      <Box flexDirection="row" justifyContent="center" alignItems="center">
        <AssetAvatarIcon asset={baseAsset} opacity={0.65} size="lg" />
        <Box
          ml="-3"
          borderRadius="round"
          borderWidth={4}
          borderColor="ink.background-primary"
          borderStyle="solid"
        >
          <AssetAvatarIcon asset={targetAsset} size="xl" />
        </Box>
      </Box>

      <Box alignItems="center" gap="1">
        <Text {...summaryTextProps} opacity={0.5}>
          -{formatCurrency(baseAmount, { compactThreshold: Infinity })}
        </Text>
        <Text {...summaryTextProps}>
          +{formatCurrency(targetAmount, { compactThreshold: Infinity })}
        </Text>
      </Box>
    </Box>
  );
}
