import { useMemo } from 'react';

import type { AccountRequest } from '@leather.io/services';

import { useCurrentAccountId } from '@app/store/accounts/account';
import { useDiscardedInscriptions } from '@app/store/settings/settings.selectors';

import { useAccountAddresses } from './use-account-addresses';

export function useAccountRequest(): AccountRequest {
  const accountId = useCurrentAccountId();
  const account = useAccountAddresses(accountId);
  const discardedInscriptions = useDiscardedInscriptions();

  return useMemo(
    () => ({
      account,
      protections: {
        discardedInscriptions,
      },
    }),
    [account, discardedInscriptions]
  );
}
