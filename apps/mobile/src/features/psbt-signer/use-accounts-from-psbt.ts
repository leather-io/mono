import { useSelectByAccountIds } from '@/store/accounts/accounts.read';

import { uniqueArray } from '@leather.io/utils';

import { getPsbtInputDerivationPaths } from './utils';

export function useAccountsFromPsbt({ psbtHex }: { psbtHex: string }) {
  const descriptors = getPsbtInputDerivationPaths({ psbtHex });

  const accountIds = uniqueArray(
    descriptors.map(descriptor => `${descriptor.fingerprint}/${descriptor.accountIndex}`)
  );

  return useSelectByAccountIds(accountIds);
}
