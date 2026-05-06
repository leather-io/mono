import { useMemo } from 'react';

import type { AccountRequest } from '@leather.io/services';

import { useCurrentAccountId } from '@app/store/accounts/account';

import { useAccountAddresses } from './use-account-addresses';

export function useNativeSegwitAccountRequest(): AccountRequest {
  const currentAccount = useCurrentAccountId();
  const account = useAccountAddresses(currentAccount);

  return useMemo(
    () => ({
      account,
      exclusions: { taprootAddresses: true },
    }),
    [account]
  );
}
