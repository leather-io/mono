import { AccountId } from '@/models/domain.model';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';

export function useGetStacksAddresses(accountId?: AccountId) {
  const signers = useStacksSigners();

  if (!accountId) {
    return signers.list.map(signer => signer.address);
  }

  const { accountIndex, fingerprint } = accountId;
  console.log('signers.list', signers.list);

  const addresses = signers.list.filter(signer => signer.descriptor.includes(fingerprint));
  const address = addresses[accountIndex]?.address ?? '';

  return [address];
}
