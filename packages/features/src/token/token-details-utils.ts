import type { Money } from '@leather.io/models';

export function getPriceChangeColor(change: number) {
  if (change > 0) return 'green.action-primary-default';
  if (change < 0) return 'red.action-primary-default';
  return 'ink.text-primary';
}

interface FormatPriceChangeTextArgs {
  changePercent: number;
  priceChangeDelta?: string;
}

export function formatPriceChangeText({
  changePercent,
  priceChangeDelta,
}: FormatPriceChangeTextArgs) {
  const hasChangePercent = typeof changePercent === 'number' && Number.isFinite(changePercent);

  if (!hasChangePercent) return '—';

  const percentText = `${changePercent.toFixed(2)}%`;
  const text = priceChangeDelta ? `${percentText} (${priceChangeDelta})` : percentText;
  return changePercent > 0 ? `+ ${text}` : text;
}

export function formatTokenAmount(balance: Money) {
  const maxDecimals = balance.decimals > 8 ? 8 : balance.decimals;
  return balance.amount.shiftedBy(-balance.decimals).toFormat(maxDecimals);
}
