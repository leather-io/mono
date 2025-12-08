import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { type AccountRequest, type RuneBalance } from '@leather.io/services';
import { createRunesAccountBalanceQueryConfig } from '@leather.io/queries';
import { isSameAsset } from '@leather.io/utils';

import { balanceQueryOptionsWithRefetch } from '@app/query/common/balance-query-options';
import { toFetchState } from '@app/services/fetch-state';
import { useAccountAddresses } from '@app/services/use-account-addresses';
import { useUserSettings } from '@app/hooks/use-user-settings';

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
  const settings = useUserSettings();
  return useQuery({
    ...createRunesAccountBalanceQueryConfig(request, settings),
    ...balanceQueryOptionsWithRefetch,
    placeholderData: keepPreviousData,
  });
}
