import { keepPreviousData } from '@tanstack/react-query';

import { type AccountRequest } from '@leather.io/services';

import {
  useGetSip10AccountBalanceQuery as useSharedGetSip10AccountBalanceQuery,
  useGetSip10AddressBalanceQuery as useSharedGetSip10AddressBalanceQuery,
} from '@leather.io/features';

import {
  balanceQueryOptions,
  balanceQueryOptionsWithRefetch,
} from '@app/query/common/balance-query-options';
import { useUserAllTokens } from '@app/store/manage-tokens/manage-tokens.slice';

export function useGetSip10AccountBalanceQuery(account: AccountRequest) {
  const tokenSettings = useUserAllTokens();
  return useSharedGetSip10AccountBalanceQuery(account, {
    queryKeyContext: [tokenSettings],
    placeholderData: keepPreviousData,
    ...balanceQueryOptionsWithRefetch,
  });
}

export function useGetSip10AddressBalanceQuery(address: string) {
  const tokenSettings = useUserAllTokens();
  return useSharedGetSip10AddressBalanceQuery(address, false, {
    queryKeyContext: [tokenSettings],
    ...balanceQueryOptions,
  });
}
