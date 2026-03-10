import BigNumber from 'bignumber.js';
import { Flex, styled } from 'leather-styles/jsx';
import type { ColorToken } from 'leather-styles/tokens';

import {
  PRICE_IMPACT_DANGER_THRESHOLD,
  PRICE_IMPACT_WARNING_THRESHOLD,
} from '@leather.io/state/swap';
import { ErrorTriangleIcon } from '@leather.io/ui';

import { formatPercentage } from '@app/common/currency-formatter';

type PriceImpactStatus = 'normal' | 'warn' | 'danger';

interface PriceImpactValueProps {
  value: BigNumber;
}

export function PriceImpactValue({ value }: PriceImpactValueProps) {
  const status = getPriceImpactValueStatus(value);
  const iconColor = priceImpactColors[status];
  const textColor = value.isGreaterThanOrEqualTo(0.1) ? iconColor : undefined;

  return (
    <Flex gap="space.01" alignItems="center">
      {status !== 'normal' && <ErrorTriangleIcon color={iconColor} variant="small" />}
      <styled.span textStyle="label.02" color={textColor}>
        {formatPercentage(value.toNumber())}
      </styled.span>
    </Flex>
  );
}

const priceImpactColors: Record<PriceImpactStatus, ColorToken> = {
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
