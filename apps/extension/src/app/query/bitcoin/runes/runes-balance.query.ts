import { keepPreviousData } from '@tanstack/react-query';

import { type AccountRequest, type RuneBalance } from '@leather.io/services';
import { isSameAsset } from '@leather.io/utils';

import {
  useGetRunesAccountBalanceQuery as useSharedGetRunesAccountBalanceQuery,
} from '@leather.io/features';

import { balanceQueryOptionsWithRefetch } from '@app/query/common/balance-query-options';
import { toFetchState } from '@app/services/fetch-state';
import { useAccountAddresses } from '@app/services/use-account-addresses';
import { useUserAllTokens } from '@app/store/manage-tokens/manage-tokens.slice';

export function useManagedRunesTools(accountIndex: number) {
  const enabledRunes = useRunesAccountBalance(accountIndex);
  return {
    isEnabled: (rune: RuneBalance) =>
      !!enabledRunes.value?.runes.find(r => isSameAsset(r.asset, rune.asset)),
  };
}

export function useRunesAccountBalance(
  accountIndex: number,
  options?: { includeHiddenAssets?: boolean }
) {
  const account = useAccountAddresses(accountIndex);
  return toFetchState(
    useGetRunesAccountBalanceQuery({
      account,
      assets: { includeHiddenAssets: options?.includeHiddenAssets },
    })
  );
}

function useGetRunesAccountBalanceQuery(request: AccountRequest) {
  const tokenSettings = useUserAllTokens();
  return useSharedGetRunesAccountBalanceQuery(request, {
    queryKeyContext: [tokenSettings],
    placeholderData: keepPreviousData,
    ...balanceQueryOptionsWithRefetch,
  });
}
