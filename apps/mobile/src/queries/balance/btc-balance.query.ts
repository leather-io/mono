import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { useQuery } from '@tanstack/react-query';

import { AccountRequest } from '@leather.io/services';
import {
  createBtcAggregateBalanceQueryConfig,
  createBtcBalanceQueryConfig,
} from '@leather.io/queries';

import { balanceQueryOptions } from './balance-query-options';
import { useUserSettings } from './use-user-settings';

export function useBtcTotalBalance() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(useBtcAggregateBalanceQuery(accounts.map(account => ({ account }))));
}

export function useBtcAccountBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useBtcAccountBalanceQuery({ account }));
}

export function useBtcAccountNativeSegwitBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(
    useBtcAccountBalanceQuery({
      account,
      exclusions: { taprootAddresses: true },
    })
  );
}

export function useBtcAccountTaprootBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(
    useBtcAccountBalanceQuery({
      account,
      exclusions: { nativeSegwitAddresses: true },
    })
  );
}

export function useBtcAccountBalanceQuery(request: AccountRequest) {
  const settings = useUserSettings();
  return useQuery({
    ...createBtcBalanceQueryConfig(request, settings),
    ...balanceQueryOptions,
  });
}

function useBtcAggregateBalanceQuery(requests: AccountRequest[]) {
  const settings = useUserSettings();
  return useQuery({
    ...createBtcAggregateBalanceQueryConfig(requests, settings),
    ...balanceQueryOptions,
  });
}
