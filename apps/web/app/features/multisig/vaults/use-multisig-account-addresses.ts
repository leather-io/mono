import type { AccountAddresses, VaultAccount, VaultAccountSummary } from '@leather.io/models';

import { createMultisigAccountAddresses } from './multisig-account-addresses';

const emptyAccountAddresses: AccountAddresses = {
  id: { fingerprint: 'multisig:none', accountIndex: 0 },
};

export function useMultisigAccountAddresses(
  account?: VaultAccount | VaultAccountSummary
): AccountAddresses {
  if (!account) return emptyAccountAddresses;
  return createMultisigAccountAddresses(account);
}
