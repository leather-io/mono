import { useQuery } from '@tanstack/react-query';

import {
  getAccountCollectiblesQueryConfig,
  type UseAccountCollectiblesQueryOptions,
} from '@leather.io/features';

import { useAccountAddresses } from '@app/services/use-account-addresses';
import { useCurrentAccountIndex } from '@app/store/accounts/account';

export function useAccountCollectibles(options: UseAccountCollectiblesQueryOptions = {}) {
  const accountIndex = useCurrentAccountIndex();
  const account = useAccountAddresses(accountIndex);
  return useQuery(
    getAccountCollectiblesQueryConfig(account, {
      ...options,
      queryKeyContext: [accountIndex, ...(options.queryKeyContext ?? [])],
    })
  );
}
