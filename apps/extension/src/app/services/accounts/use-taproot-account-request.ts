import { useMemo } from 'react';

import type { AccountRequest } from '@leather.io/services';

import { useCurrentAccountIndex } from '@app/store/accounts/account';
import { useDiscardedInscriptions } from '@app/store/settings/settings.selectors';

import { useAccountAddresses } from './use-account-addresses';

export function useTaprootAccountRequest(): AccountRequest {
  const accountIndex = useCurrentAccountIndex();
  const account = useAccountAddresses(accountIndex);
  const discardedInscriptions = useDiscardedInscriptions();

  return useMemo(
    () => ({
      account,
      protections: {
        discardedInscriptions,
      },
      exclusions: { nativeSegwitAddresses: true },
    }),
    [account, discardedInscriptions]
  );
}
