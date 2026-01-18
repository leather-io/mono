import { formatPercentage } from '@/utils/currency-formatter';
import BigNumber from 'bignumber.js';

import {
  PRICE_IMPACT_DANGER_THRESHOLD,
  PRICE_IMPACT_WARNING_THRESHOLD,
} from '@leather.io/state/swap';
import { Box, ErrorTriangleIcon, Text, Theme } from '@leather.io/ui/native';

type PriceImpactStatus = 'normal' | 'warn' | 'danger';

interface PriceImpactValueProps {
  value: BigNumber;
}

export function PriceImpactValue({ value }: PriceImpactValueProps) {
  const status = getPriceImpactValueStatus(value);
  const iconColor = priceImpactColors[status];
  const textColor = value.isGreaterThanOrEqualTo(0.1) ? iconColor : undefined;

  return (
    <Box flexDirection="row" gap="1" alignItems="center">
      {status !== 'normal' && <ErrorTriangleIcon color={iconColor} variant="small" />}
      <Text color={textColor} variant="label02">
        {formatPercentage(value.toNumber())}
      </Text>
    </Box>
  );
}

const priceImpactColors: Record<PriceImpactStatus, keyof Theme['colors']> = {
  normal: 'ink.text-primary',
  warn: 'yellow.action-primary-default',
  danger: 'red.action-primary-default',
};

function getPriceImpactValueStatus(value: BigNumber): PriceImpactStatus {
  if (
    value.isGreaterThanOrEqualTo(PRICE_IMPACT_WARNING_THRESHOLD) &&
    value.isLessThan(PRICE_IMPACT_DANGER_THRESHOLD)
  ) {
    return 'warn';
  }

  if (value.isGreaterThanOrEqualTo(PRICE_IMPACT_DANGER_THRESHOLD)) {
    return 'danger';
  }

  return 'normal';
}
