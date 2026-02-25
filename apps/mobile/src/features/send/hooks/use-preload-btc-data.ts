import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useAccountRequest } from '@/hooks/use-account-request';
import { useBitcoinTransactionFees } from '@/queries/fees/bitcoin-transaction-fees.hooks';
import { useBtcMarketDataQuery } from '@/queries/market-data/btc-market-data.query';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { AccountId } from '@leather.io/models';
import { getUtxosService } from '@leather.io/services';
import { createMoney } from '@leather.io/utils';

export function usePreloadBtcData(account: AccountId) {
  const accountRequest = useAccountRequest();
  useBitcoinTransactionFees({
    account: accountRequest,
    recipients: [{ address: '', amount: createMoney(0, 'BTC') }],
  });
  useBtcMarketDataQuery();
  const { fingerprint, accountIndex } = account;
  const accountAddresses = useAccountAddresses(fingerprint, accountIndex);

  useQuery({
    queryKey: ['utxos-service-get-account-utxos', accountAddresses],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getUtxosService().getAccountUtxos({ account: accountAddresses }, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 30 * 1000,
    gcTime: 30 * 1000,
  });
}
