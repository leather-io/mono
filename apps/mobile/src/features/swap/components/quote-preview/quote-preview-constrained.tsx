import { formatCurrency } from '@/utils/currency-formatter';
import { t } from '@lingui/core/macro';

import { ExecutionConstraint, SwappableFungibleCryptoAsset } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';
import { assertUnreachable } from '@leather.io/utils';

interface QuotePreviewConstrainedProps {
  constraints: ExecutionConstraint[];
  baseAsset: SwappableFungibleCryptoAsset;
  targetAsset: SwappableFungibleCryptoAsset;
}

export function QuotePreviewConstrained({
  constraints,
  baseAsset,
  targetAsset,
}: QuotePreviewConstrainedProps) {
  const constraint = constraints[0];
  if (!constraint) return null;
  const { title, description } = getConstraintCopy(constraint, baseAsset, targetAsset);

  return (
    <Box backgroundColor="yellow.background-primary" borderRadius="sm" p="4" gap="2">
      <Text variant="label03">{title}</Text>
      <Text variant="caption01">{description}</Text>
    </Box>
  );
}

function getConstraintCopy(
  constraint: ExecutionConstraint,
  baseAsset: SwappableFungibleCryptoAsset,
  targetAsset: SwappableFungibleCryptoAsset
): { title: string; description: string } {
  const threshold = formatCurrency(constraint.threshold);
  const operation = getOperationLabel(baseAsset.symbol, targetAsset.symbol);
  const baseAssetSymbol = baseAsset.symbol;
  const targetAssetSymbol = targetAsset.symbol;

  switch (constraint.reason) {
    case 'minimum-threshold-not-met':
      return {
        title: t`Amount too small`,
        description: t`${operation} ${baseAssetSymbol} to ${targetAssetSymbol} requires at least ${threshold}`,
      };
    case 'maximum-threshold-exceeded':
      return {
        title: t`Amount too large`,
        description: t`${operation} ${baseAssetSymbol} to ${targetAssetSymbol} is limited to ${threshold}`,
      };
    default:
      assertUnreachable(constraint.reason);
  }
}

function getOperationLabel(base: string, target: string): string {
  if (base === 'BTC' && target === 'sBTC') return t`Depositing`;
  if (base === 'sBTC' && target === 'BTC') return t`Withdrawing`;
  return t`Swapping`;
}
