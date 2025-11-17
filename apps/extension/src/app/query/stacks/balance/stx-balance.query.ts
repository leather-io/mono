import { useMemo, useSyncExternalStore } from 'react';

import { type QueryFunctionContext, useQuery } from '@tanstack/react-query';
import type { Observable } from 'rxjs';

import { type AccountRequest, getStxBalancesService } from '@leather.io/services';

import {
  balanceQueryOptions,
  balanceQueryOptionsWithRefetch,
} from '@app/query/common/balance-query-options';

export function useGetStxAccountBalanceQuery(account: AccountRequest) {
  return useQuery({
    queryKey: ['stx-balances-service-get-stx-account-balance', account],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getStxBalancesService().getStxAccountBalance(account, signal),
    ...balanceQueryOptionsWithRefetch,
  });
}

export function useGetStxAddressBalanceQuery(address: string) {
  return useQuery({
    queryKey: ['stx-balances-service-get-stx-address-balance', address],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getStxBalancesService().getStxAddressBalance(address, signal),
    enabled: !!address,
    ...balanceQueryOptions,
  });
}

export function useObservable<T>(observable: Observable<T>): T {
  const store = useMemo(() => {
    let currentValue: T;
    const subscribe = (onChange: (value: any) => void) => {
      const sub = observable.subscribe(value => {
        currentValue = value;
        onChange(value);
      });
      return () => sub.unsubscribe();
    };
    const getSnapshot = () => currentValue;
    return { subscribe, getSnapshot };
  }, [observable]);

  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}

export function useStxBalanceExperimentalStream(address: string) {
  const stxBalance$ = useMemo(
    () => getStxBalancesService().getStxAddressBalanceExperimentalStream(address),
    [address]
  );
  return useObservable(stxBalance$);
}
