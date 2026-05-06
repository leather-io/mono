import { useOrdinalsFlag } from '@/features/feature-flags';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useAverageBitcoinFeeRates } from '@/queries/fees/fee-estimates.hooks';
import { useBtcMarketDataQuery } from '@/queries/market-data/btc-market-data.query';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { AccountId } from '@leather.io/models';
import { getUtxosService } from '@leather.io/services';

export function usePreloadBtcData(account: AccountId) {
  useAverageBitcoinFeeRates();
  useBtcMarketDataQuery();
  const { fingerprint, accountIndex } = account;
  const accountAddresses = useAccountAddresses(fingerprint, accountIndex);
  const ordinalsFlag = useOrdinalsFlag();

  useQuery({
    queryKey: [
      'utxos-service-get-account-utxos',
      accountAddresses,
      ordinalsFlag ? 'ordinals-on' : 'ordinals-off',
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getUtxosService().getAccountUtxos(
        {
          account: accountAddresses,
          protections: {
            isRunesActive: false,
            isOrdinalsActive: ordinalsFlag,
            discardedInscriptions: [],
            discardRunes: true,
          },
        },
        signal
      ),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 30 * 1000,
    gcTime: 30 * 1000,
  });
}
