import { useMemo } from 'react';

import type { AccountRequest } from '@leather.io/services';

import { useRunesEnabled } from '@app/query/bitcoin/runes/runes.hooks';
import { useCurrentAccountIndex } from '@app/store/accounts/account';
import { useDiscardedInscriptions } from '@app/store/settings/settings.selectors';

import { useAccountAddresses } from './use-account-addresses';

export function useNativeSegwitAccountRequest(): AccountRequest {
  const accountIndex = useCurrentAccountIndex();
  const account = useAccountAddresses(accountIndex);
  const discardedInscriptions = useDiscardedInscriptions();
  const runesEnabled = useRunesEnabled();

  return useMemo(
    () => ({
      account,
      protections: {
        discardedInscriptions,
        discardRunes: !runesEnabled,
      },
      exclusions: { taprootAddresses: true },
    }),
    [account, discardedInscriptions, runesEnabled]
  );
}
