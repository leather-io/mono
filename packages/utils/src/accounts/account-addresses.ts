import {
  AccountAddresses,
  AccountId,
  BitcoinAddressInfo,
  StacksAddressInfo,
} from '@leather.io/models';

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
    };
  }
  if (stxAddress) {
    accountAddresses.stacks = { stxAddress };
  }
  return accountAddresses;
}

export function hasBitcoinAddress(
  account: AccountAddresses
): account is AccountAddresses & { bitcoin: BitcoinAddressInfo } {
  return account.bitcoin !== undefined;
}

export function hasStacksAddress(
  account: AccountAddresses
): account is AccountAddresses & { stacks: StacksAddressInfo } {
  return account.stacks !== undefined;
}
