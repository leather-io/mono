import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { Money, SwappableFungibleCryptoAsset } from '@leather.io/models';
import { AssetAvatarIcon } from '@leather.io/ui';

import { formatCurrency } from '@app/common/currency-formatter';

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
    <Stack gap="space.03" alignItems="center">
      <Flex justifyContent="center" alignItems="center">
        <Box opacity={0.65}>
          <AssetAvatarIcon asset={baseAsset} size="lg" />
        </Box>
        <Box
          ml="-space.03"
          borderRadius="round"
          borderWidth="4px"
          borderColor="ink.background-primary"
          borderStyle="solid"
          zIndex="10"
        >
          <AssetAvatarIcon asset={targetAsset} size="xl" />
        </Box>
      </Flex>

      <Stack gap="space.01" alignItems="center">
        <styled.span
          textStyle="heading.03"
          textTransform="none"
          fontSize={24}
          lineHeight={1.2}
          opacity={0.5}
        >
          -{formatCurrency(baseAmount, { compactThreshold: Infinity })}
        </styled.span>
        <styled.span textStyle="heading.03" textTransform="none" fontSize={24} lineHeight={1.2}>
          +{formatCurrency(targetAmount, { compactThreshold: Infinity })}
        </styled.span>
      </Stack>
    </Stack>
  );
}
