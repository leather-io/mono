import { useOrdinalsFlag } from '@/features/feature-flags';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useCurrentAccount } from '@/hooks/use-current-account';

import { AccountRequest } from '@leather.io/services';

export function useAccountRequest(): AccountRequest {
  const currentAccount = useCurrentAccount();
  const ordinalsFlag = useOrdinalsFlag();
  const accountAddresses = useAccountAddresses(
    currentAccount.fingerprint,
    currentAccount.accountIndex
  );
  return {
    account: accountAddresses,
    protections: {
      isRunesActive: false,
      isOrdinalsActive: ordinalsFlag,
      discardedInscriptions: [],
      discardRunes: true,
    },
  };
}
