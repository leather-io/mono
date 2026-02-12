import type { RuneBalance } from '@leather.io/services';
import { isSameAsset } from '@leather.io/utils';

import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { toFetchState } from '@app/services/fetch-state';

import {
  useGetRuneBalanceByRuneNameQuery,
  useGetRunesAccountBalanceQuery,
} from './runes-balance.query';

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

export function useRuneBalanceByRuneName(accountIndex: number, runeName: string) {
  const account = useAccountAddresses(accountIndex);
  return toFetchState(useGetRuneBalanceByRuneNameQuery({ account }, runeName));
}
