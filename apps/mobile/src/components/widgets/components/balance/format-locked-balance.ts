interface Balance {
  amount: string;
  symbol: string;
  decimals: number;
}
export function formatLockedBalance(balance: Balance) {
  if (!balance || !balance.amount || !balance.decimals) return null;

  const amount = parseFloat(balance.amount) / Math.pow(10, balance.decimals);
  return amount.toString().replace(/\.?0+$/, '');
}
