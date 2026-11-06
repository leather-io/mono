import { type AccountAddresses, type AccountId } from '@leather.io/models';

export function createAccountAddresses(
  accountId: AccountId,
  btcDescriptors: string[] = [],
  stxAddress?: string
): AccountAddresses {
  const accountAddresses: AccountAddresses = { id: accountId };
  const taprootDescriptor = btcDescriptors.find(desc => desc.startsWith('tr('));
  const nativeSegwitDescriptor = btcDescriptors.find(desc => desc.startsWith('wpkh('));
  if (taprootDescriptor && nativeSegwitDescriptor) {
    accountAddresses.bitcoin = {
      type: 'hd',
      taprootDescriptor,
      nativeSegwitDescriptor,
    };
  }
  if (stxAddress) {
    accountAddresses.stacks = { stxAddress };
  }
  return accountAddresses;
}
