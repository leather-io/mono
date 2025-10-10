import {
  AccountAddresses,
  BitcoinAddressInfo,
  StacksAddressInfo,
} from '@leather.io/models';

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
