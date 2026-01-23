import { useMemo } from 'react';

import type { AccountRequest } from '@leather.io/services';

import { useCurrentAccountId } from '@app/store/accounts/account';
import { useDiscardedInscriptions } from '@app/store/settings/settings.selectors';

import { useAccountAddresses } from './use-account-addresses';

export function useNativeSegwitAccountRequest(): AccountRequest {
  const currentAccount = useCurrentAccountId();
  const account = useAccountAddresses(currentAccount);
  const discardedInscriptions = useDiscardedInscriptions();

  return useMemo(
    () => ({
      account,
      protections: {
        discardedInscriptions,
      },
      exclusions: { taprootAddresses: true },
    }),
    [account, discardedInscriptions]
  );
}
