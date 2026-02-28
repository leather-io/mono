import { styled } from 'leather-styles/jsx';

import { ExecutionConstraint, SwappableFungibleCryptoAsset } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';

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
    <styled.div
      display="flex"
      flexDirection="column"
      bg="yellow.background-primary"
      borderRadius="sm"
      p="space.04"
      gap="space.02"
    >
      <styled.span textStyle="label.03">{title}</styled.span>
      <styled.span textStyle="caption.01">{description}</styled.span>
    </styled.div>
  );
}

function getConstraintCopy(
  constraint: ExecutionConstraint,
  baseAsset: SwappableFungibleCryptoAsset,
  targetAsset: SwappableFungibleCryptoAsset
): { title: string; description: string } {
  const threshold = formatCurrency(constraint.threshold);
  const operation = getOperationLabel(baseAsset.symbol, targetAsset.symbol);

  switch (constraint.reason) {
    case 'minimum-threshold-not-met':
      return {
        title: 'Amount too small',
        description: `${operation} ${baseAsset.symbol} to ${targetAsset.symbol} requires at least ${threshold}`,
      };
    case 'maximum-threshold-exceeded':
      return {
        title: 'Amount too large',
        description: `${operation} ${baseAsset.symbol} to ${targetAsset.symbol} is limited to ${threshold}`,
      };
    default:
      assertUnreachable(constraint.reason);
  }
}

function getOperationLabel(base: string, target: string): string {
  if (base === 'BTC' && target === 'sBTC') return 'Depositing';
  if (base === 'sBTC' && target === 'BTC') return 'Withdrawing';
  return 'Swapping';
}
