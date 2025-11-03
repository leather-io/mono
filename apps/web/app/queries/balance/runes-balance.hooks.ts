import { useQuery } from '@tanstack/react-query';

export function useRunesAccountBalance() {
  return useQuery({
    queryKey: ['runes-balances-web-disabled'],
    queryFn: () => ({ runes: [], quote: { availableBalance: { amount: 0 } } }),
    enabled: false,
  });
}
