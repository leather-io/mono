import { useMemo } from 'react';

import type { AccountRequest } from '@leather.io/services';

import { useCurrentAccountId } from '@app/store/accounts/account';

import { useAccountAddresses } from './use-account-addresses';

export function useAccountRequest(): AccountRequest {
  const accountId = useCurrentAccountId();
  const account = useAccountAddresses(accountId);

  return useMemo(() => ({ account }), [account]);
}
