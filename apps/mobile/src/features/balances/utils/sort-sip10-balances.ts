import { Sip10AggregateBalance } from '@leather.io/services';

export function sortSip10Balances(
  a: Sip10AggregateBalance['sip10s'][number],
  b: Sip10AggregateBalance['sip10s'][number]
) {
  // sBTC should always be first
  if (a.asset.symbol === 'sBTC') return -1;
  if (b.asset.symbol === 'sBTC') return 1;

  // Sort by quote total balance
  const quoteDiff = Number(b.quote.totalBalance.amount) - Number(a.quote.totalBalance.amount);
  if (quoteDiff !== 0) return quoteDiff;

  // Sort by crypto total balance
  const cryptoDiff = Number(b.crypto.totalBalance.amount) - Number(a.crypto.totalBalance.amount);
  if (cryptoDiff !== 0) return cryptoDiff;

  // Finally sort alphabetically by symbol
  return a.asset.symbol.localeCompare(b.asset.symbol);
}
