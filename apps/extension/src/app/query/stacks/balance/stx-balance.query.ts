import { type AccountRequest } from '@leather.io/services';

import {
  useGetStxAccountBalanceQuery as useSharedGetStxAccountBalanceQuery,
  useGetStxAddressBalanceQuery as useSharedGetStxAddressBalanceQuery,
} from '@leather.io/features';

import {
  balanceQueryOptions,
  balanceQueryOptionsWithRefetch,
} from '@app/query/common/balance-query-options';

export function useGetStxAccountBalanceQuery(account: AccountRequest) {
  return useSharedGetStxAccountBalanceQuery(account, balanceQueryOptionsWithRefetch);
}

export function useGetStxAddressBalanceQuery(address: string) {
  return useSharedGetStxAddressBalanceQuery(address, balanceQueryOptions);
}
