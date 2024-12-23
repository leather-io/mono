import { useSelectByAccountIds } from '@/store/accounts/accounts.read';

import { uniqueArray } from '@leather.io/utils';

import { getPsbtInputDerivationPaths, getPsbtOutputDerivationPaths } from './utils';

export function usePsbtAccounts({ psbtHex }: { psbtHex: string }) {
  const descriptors = [
    ...getPsbtInputDerivationPaths({ psbtHex }),
    ...getPsbtOutputDerivationPaths({ psbtHex }),
  ];

  const accountIds = uniqueArray(
    descriptors.map(descriptor => `${descriptor.fingerprint}/${descriptor.accountIndex}`)
  );

  const accounts = useSelectByAccountIds(accountIds);

  return accounts;
}
