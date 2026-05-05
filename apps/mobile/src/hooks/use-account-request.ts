import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useCurrentAccount } from '@/hooks/use-current-account';

import { AccountRequest } from '@leather.io/services';

export function useAccountRequest(): AccountRequest {
  const currentAccount = useCurrentAccount();
  const accountAddresses = useAccountAddresses(
    currentAccount.fingerprint,
    currentAccount.accountIndex
  );
  return {
    account: accountAddresses,
    protections: {
      isOrdinalsActive: true,
      discardedInscriptions: [],
    },
  };
}
