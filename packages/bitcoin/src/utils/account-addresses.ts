import {
  AccountAddresses,
  AccountId,
} from '@leather.io/models';

import { deriveAddressFromDescriptor } from './bitcoin.descriptors';

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
      taprootDescriptor,
      nativeSegwitDescriptor,
      taprootAddress: deriveAddressFromDescriptor(taprootDescriptor),
      nativeSegwitAddress: deriveAddressFromDescriptor(nativeSegwitDescriptor),
    };
  }
  if (stxAddress) {
    accountAddresses.stacks = { stxAddress };
  }
  return accountAddresses;
}
