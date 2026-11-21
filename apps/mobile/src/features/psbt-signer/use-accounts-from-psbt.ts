import { useSelectByAccountIds } from '@/store/accounts/accounts.read';

import { makeAccountIdentifer } from '@leather.io/crypto';
import { uniqueArray } from '@leather.io/utils';

import { getPsbtInputDerivationPaths } from './utils';

export function useAccountsFromPsbt({ psbtHex }: { psbtHex: string }) {
  const descriptors = getPsbtInputDerivationPaths({ psbtHex });

  const accountIds = uniqueArray(
    descriptors.map(descriptor =>
      makeAccountIdentifer(descriptor.fingerprint, descriptor.accountIndex)
    )
  );

  return useSelectByAccountIds(accountIds);
}
