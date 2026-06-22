import {
  AccountAddresses,
  AccountId,
  BitcoinAddressInfo,
  HdBitcoinAddressInfo,
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

export function hasBitcoinAddress(
  account: AccountAddresses
): account is AccountAddresses & { bitcoin: BitcoinAddressInfo } {
  return account.bitcoin !== undefined;
}

export function hasHdBitcoinAddress(
  account: AccountAddresses
): account is AccountAddresses & { bitcoin: HdBitcoinAddressInfo } {
  return account.bitcoin?.type === 'hd';
}

export function hasStacksAddress(
  account: AccountAddresses
): account is AccountAddresses & { stacks: StacksAddressInfo } {
  return account.stacks !== undefined;
}
