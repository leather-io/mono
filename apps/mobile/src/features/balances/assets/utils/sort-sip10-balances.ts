import { Sip10AggregateBalance } from '@leather.io/services';
import { getPinnedAssetPriority } from '@leather.io/utils';

export function sortSip10Balances(
  a: Sip10AggregateBalance['sip10s'][number],
  b: Sip10AggregateBalance['sip10s'][number]
) {
  const priorityDiff = getPinnedAssetPriority(a.asset) - getPinnedAssetPriority(b.asset);
  if (priorityDiff !== 0) return priorityDiff;

  // Sort by quote total balance
  const quoteDiff = Number(b.quote.totalBalance.amount) - Number(a.quote.totalBalance.amount);
  if (quoteDiff !== 0) return quoteDiff;

  // Sort by crypto total balance
  const cryptoDiff = Number(b.crypto.totalBalance.amount) - Number(a.crypto.totalBalance.amount);
  if (cryptoDiff !== 0) return cryptoDiff;

  // Finally sort alphabetically by symbol
  return a.asset.symbol.localeCompare(b.asset.symbol);
}
