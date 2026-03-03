import {
  type BitcoinAccount,
  getNativeSegwitPaymentFromAddressIndex,
  getTaprootPaymentFromAddressIndex,
} from '@leather.io/bitcoin';

import { useCurrentAccountIndex } from '@app/store/accounts/account';
import { useGenerateNativeSegwitAccount } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useGenerateTaprootAccount } from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';

interface GetTaprootAddressParams {
  trAccount: BitcoinAccount;
  changeIndex: number;
  addressIndex: number;
}
function getTaprootAddress({ trAccount, changeIndex, addressIndex }: GetTaprootAddressParams) {
  const trAddressKeychain = trAccount.keychain.deriveChild(changeIndex).deriveChild(addressIndex);
  const trAddress = getTaprootPaymentFromAddressIndex(trAddressKeychain, trAccount.network).address;
  return trAddress;
}

interface GetNativeSegwitAddressParams {
  nsAccount: BitcoinAccount;
  changeIndex: number;
  addressIndex: number;
}
function getNativeSegwitAddress({
  nsAccount,
  changeIndex,
  addressIndex,
}: GetNativeSegwitAddressParams) {
  const nsAddressKeychain = nsAccount.keychain.deriveChild(changeIndex).deriveChild(addressIndex);
  const nsAddress = getNativeSegwitPaymentFromAddressIndex(
    nsAddressKeychain,
    nsAccount.network
  ).address;
  return nsAddress;
}

interface DeriveAddressSetForAccountParams {
  nsAccount: BitcoinAccount;
  trAccount: BitcoinAccount;
  maxAddressIndex?: number;
}

function deriveAddressSetForAccount({
  nsAccount,
  trAccount,
  maxAddressIndex = 250,
}: DeriveAddressSetForAccountParams) {
  const addresses = new Set<string>();
  for (let addressIndex = 0; addressIndex < maxAddressIndex; ++addressIndex) {
    for (let changeIndex = 0; changeIndex < 1; ++changeIndex) {
      const trAddress = getTaprootAddress({ trAccount, changeIndex, addressIndex });

      if (trAddress) addresses.add(trAddress);

      const nsAddress = getNativeSegwitAddress({ nsAccount, changeIndex, addressIndex });

      if (nsAddress) addresses.add(nsAddress);
    }
  }
  return addresses;
}

interface AsyncDeriveAddressSetForAccountParams {
  nsAccount: BitcoinAccount;
  trAccount: BitcoinAccount;
  maxAddressIndex?: number;
  chunkSize?: number;
}

async function asyncDeriveAddressSetForAccount({
  nsAccount,
  trAccount,
  maxAddressIndex = 250,
  chunkSize = 50,
}: AsyncDeriveAddressSetForAccountParams) {
  const addresses = new Set<string>();
  for (let i = 0; i < maxAddressIndex; i += chunkSize) {
    const end = Math.min(i + chunkSize, maxAddressIndex);
    for (let addressIndex = i; addressIndex < end; ++addressIndex) {
      for (let changeIndex = 0; changeIndex < 1; ++changeIndex) {
        const trAddress = getTaprootAddress({ trAccount, changeIndex, addressIndex });

        if (trAddress) addresses.add(trAddress);

        const nsAddress = getNativeSegwitAddress({ nsAccount, changeIndex, addressIndex });

        if (nsAddress) addresses.add(nsAddress);
      }
    }
    if (i + chunkSize < maxAddressIndex) {
      await new Promise<void>(resolve => setTimeout(resolve, 0));
    }
  }

  return addresses;
}

export function useDeriveAddressSetForCurrentAccount() {
  const currentAccount = useCurrentAccountIndex();
  const nsAccount = useGenerateNativeSegwitAccount()(currentAccount);
  const trAccount = useGenerateTaprootAccount()(currentAccount);
  return {
    deriveAddresses() {
      // or maybe throw an error here
      if (!nsAccount || !trAccount) return new Set<string>();
      return deriveAddressSetForAccount({ nsAccount, trAccount, maxAddressIndex: 2000 });
    },
    asyncDeriveAddresses() {
      // or maybe throw an error here
      if (!nsAccount || !trAccount) throw new Error('no accounts found');
      return asyncDeriveAddressSetForAccount({ nsAccount, trAccount, maxAddressIndex: 2000 });
    },
  };
}
