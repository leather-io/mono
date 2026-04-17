import { useMemo } from 'react';

import type { AccountRequest } from '@leather.io/services';

import { useFlags } from '@app/features/feature-flags';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useDiscardedInscriptions } from '@app/store/settings/settings.selectors';

import { useAccountAddresses } from './use-account-addresses';

export function useAccountRequest(): AccountRequest {
  const accountId = useCurrentAccountId();
  const account = useAccountAddresses(accountId);
  const discardedInscriptions = useDiscardedInscriptions();
  const { isOrdinalsActive } = useFlags();

  return useMemo(
    () => ({
      account,
      protections: {
        discardedInscriptions,
        isOrdinalsActive,
      },
    }),
    [account, discardedInscriptions, isOrdinalsActive]
  );
}
