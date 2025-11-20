import { useQuery } from '@tanstack/react-query';

import {
  type UseAccountActivityQueryOptions,
  getAccountActivityQueryConfig,
} from '@leather.io/features';
import { type AccountAddresses } from '@leather.io/models';

function useAccountActivityQuery(
  account: AccountAddresses,
  options: UseAccountActivityQueryOptions = {}
) {
  return useQuery(getAccountActivityQueryConfig(account, options));
}

export function useAccountActivity(
  account: AccountAddresses,
  options?: UseAccountActivityQueryOptions
) {
  return useAccountActivityQuery(account, options);
}
