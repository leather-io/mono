import { AccountId } from '@/models/domain.model';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';

export function useGetStacksAddresses(accountId?: AccountId) {
  const signers = useStacksSigners();

  if (!accountId) {
    return signers.list.map(signer => signer.address);
  }

  const { accountIndex, fingerprint } = accountId;
  return signers.list
    .filter(
      signer => signer.descriptor.includes(fingerprint) && signer.accountIndex === accountIndex
    )
    .map(signer => signer.address);
}
