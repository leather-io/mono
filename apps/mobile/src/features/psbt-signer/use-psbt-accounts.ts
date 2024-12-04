import { useSelectByAccountIds } from '@/store/accounts/accounts.read';

import { getPsbtInputDerivationPaths, getPsbtOutputDerivationPaths } from './utils';

export function usePsbtAccounts({ psbtHex }: { psbtHex: string }) {
  const descriptors = [
    ...getPsbtInputDerivationPaths({ psbtHex }),
    ...getPsbtOutputDerivationPaths({ psbtHex }),
  ];

  const accountIds = descriptors.map(
    descriptor => `${descriptor.fingerprint}/${descriptor.accountIndex}`
  );

  const accounts = useSelectByAccountIds(accountIds);

  return accounts;
}
