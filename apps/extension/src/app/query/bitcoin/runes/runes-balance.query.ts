import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { AccountId } from '@leather.io/models';
import {
  createRuneBalanceByRuneNameQueryConfig,
  createRunesAccountBalanceQueryConfig,
} from '@leather.io/queries';
import { type AccountRequest, type RuneBalance } from '@leather.io/services';
import { isSameAsset } from '@leather.io/utils';

import { useFlags } from '@app/features/feature-flags';
import { useUserSettings } from '@app/hooks/use-user-settings';
import { balanceQueryOptionsWithRefetch } from '@app/query/common/balance-query-options';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { toFetchState } from '@app/services/fetch-state';

export function useManagedRunesTools(accountId: AccountId) {
  const enabledRunes = useRunesAccountBalance(accountId);
  return {
    isEnabled: (rune: RuneBalance) =>
      !!enabledRunes.value?.runes.find(r => isSameAsset(r.asset, rune.asset)),
  };
}

export function useRunesAccountBalance(
  accountId: AccountId,
  options?: { includeHiddenAssets?: boolean }
) {
  const account = useAccountAddresses(accountId);
  const { isOrdinalsActive, isRunesActive } = useFlags();
  return toFetchState(
    useGetRunesAccountBalanceQuery({
      account,
      protections: { isOrdinalsActive, isRunesActive },
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

export function useRuneBalanceByRuneName(accountId: AccountId, runeName: string) {
  const account = useAccountAddresses(accountId);
  const { isOrdinalsActive, isRunesActive } = useFlags();
  return toFetchState(
    useGetRuneBalanceByRuneNameQuery(
      { account, protections: { isOrdinalsActive, isRunesActive } },
      runeName
    )
  );
}

function useGetRuneBalanceByRuneNameQuery(request: AccountRequest, runeName: string) {
  const settings = useUserSettings();
  return useQuery({
    ...createRuneBalanceByRuneNameQueryConfig(request, runeName, settings),
    ...balanceQueryOptionsWithRefetch,
    placeholderData: keepPreviousData,
  });
}
