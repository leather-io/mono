import { useCallback, useMemo } from 'react';

import { Account } from '@/store/accounts/accounts';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { omit } from 'remeda';

import { FungibleCryptoAssetInfo } from '@leather.io/models';

interface UseAccountHelpersResult {
  findAccountByAddress: (address: string) => Account | null;
  getAddressByAccount: (fingerprint: string, index: number) => string;
}

export function useAccountHelpers(
  accounts: Account[],
  assetInfo: FungibleCryptoAssetInfo
): UseAccountHelpersResult {
  const accountIndexByPaymentType = useBitcoinAccounts().accountIndexByPaymentType;
  const fromAccountIndex = useStacksSigners().fromAccountIndex;

  const getSegwitAddress = useCallback(
    (fingerprint: string, index: number) =>
      accountIndexByPaymentType(fingerprint, index).nativeSegwit.derivePayer({
        addressIndex: 0,
      }).address,
    [accountIndexByPaymentType]
  );

  const getTaprootAddress = useCallback(
    (fingerprint: string, index: number) =>
      accountIndexByPaymentType(fingerprint, index).taproot.derivePayer({
        addressIndex: 0,
      }).address,
    [accountIndexByPaymentType]
  );

  const getStacksSignerAddress = useCallback(
    (fingerprint: string, index: number) => fromAccountIndex(fingerprint, index)[0]?.address ?? '',
    [fromAccountIndex]
  );

  const accountsWithAddresses = useMemo(
    () =>
      accounts.map(a => {
        return {
          ...a,
          addresses: [
            getSegwitAddress(a.fingerprint, a.accountIndex),
            getTaprootAddress(a.fingerprint, a.accountIndex),
            getStacksSignerAddress(a.fingerprint, a.accountIndex),
          ],
        };
      }),
    [accounts, getSegwitAddress, getTaprootAddress, getStacksSignerAddress]
  );

  const getAccountByAddress = useCallback(
    (address: string) => {
      const account = accountsWithAddresses.find(a => a.addresses.includes(address));
      if (!account) {
        return null;
      }

      return omit(account, ['addresses']);
    },
    [accountsWithAddresses]
  );

  return {
    findAccountByAddress: getAccountByAddress,
    getAddressByAccount: assetInfo.chain === 'stacks' ? getStacksSignerAddress : getSegwitAddress,
  };
}
