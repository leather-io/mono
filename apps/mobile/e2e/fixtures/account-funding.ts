import { type WalletAccount, readAccountDirectory } from '../e2e-state';

const accountsPerWalletRank = 10;
const unknownAddressRankBase = 100;
const unknownAddressRankSpread = 100;
const extendedPublicKey = /[xt]pub[1-9A-HJ-NP-Za-km-z]+/;

function rankOf({ walletIndex, accountIndex }: WalletAccount) {
  return walletIndex * accountsPerWalletRank + accountIndex;
}

function hashRank(value: string) {
  const sum = [...value].reduce((total, char) => total + char.charCodeAt(0), 0);
  return unknownAddressRankBase + (sum % unknownAddressRankSpread);
}

export function bitcoinDescriptorRank(descriptor: string) {
  const accounts = readAccountDirectory();
  if (!accounts) return 0;
  const key = extendedPublicKey.exec(descriptor)?.[0];
  const account = key === undefined ? null : accounts.bitcoinAccountOf(key);
  return account ? rankOf(account) : hashRank(descriptor);
}

export function stacksAddressRank(address: string) {
  const accounts = readAccountDirectory();
  if (!accounts) return 0;
  const account = accounts.stacksAccountOf(address);
  return account ? rankOf(account) : hashRank(address);
}

export function isFirstAccount(address: string) {
  return stacksAddressRank(address) === 0;
}
