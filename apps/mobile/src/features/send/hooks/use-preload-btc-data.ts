import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useAverageBitcoinFeeRates } from '@/queries/fees/fee-estimates.hooks';
import { useBtcMarketDataQuery } from '@/queries/market-data/btc-market-data.query';
import { Account } from '@/store/accounts/accounts';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { getUtxosService } from '@leather.io/services';

export function usePreloadBtcData(account: Account | null) {
  useAverageBitcoinFeeRates();
  useBtcMarketDataQuery();
  const enabled = account !== null;
  const { accountIndex, fingerprint } = account ?? { accountIndex: 0, fingerprint: '' };
  const accountAddresses = useAccountAddresses(fingerprint, accountIndex);

  useQuery({
    queryKey: ['utxos-service-get-account-utxos', accountAddresses],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getUtxosService().getAccountUtxos(accountAddresses, [], signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 30 * 1000,
    gcTime: 30 * 1000,
    enabled,
  });
}
