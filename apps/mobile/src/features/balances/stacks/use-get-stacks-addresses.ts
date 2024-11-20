import { AccountId } from '@/models/domain.model';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';

export function useGetStacksAddresses(accountId?: AccountId) {
  const signers = useStacksSigners();

  if (!accountId) {
    return signers.list.map(signer => signer.address);
  }

  const { accountIndex } = accountId;
  console.log('signers.list', signers.list);
  // is this wrong? all signer descriptors underneath the same wallet have the same fingerprint
  // return signers.list
  //   .filter(signer => signer.descriptor.includes(fingerprint))
  //   .map(signer => signer.address);

  const account = signers.list[accountIndex];
  if (!account) return [];
  return [account.address];
}
