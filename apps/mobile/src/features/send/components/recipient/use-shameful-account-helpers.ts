import { useCallback, useMemo } from 'react';

import { Account } from '@/store/accounts/accounts';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { omit } from 'remeda';

import { FungibleCryptoAsset } from '@leather.io/models';

interface UseAccountHelpersResult {
  findAccountByAddress: (address: string) => Account | null;
  getAddressByAccount: (fingerprint: string, index: number) => string | null;
}

export function useAccountHelpers(
  accounts: Account[],
  asset: FungibleCryptoAsset
): UseAccountHelpersResult {
  const accountIndexByPaymentType = useBitcoinAccounts().accountIndexByPaymentType;
  const fromAccountIndex = useStacksSigners().fromAccountIndex;

  const getSegwitAddress = useCallback(
    (fingerprint: string, index: number) =>
      accountIndexByPaymentType(fingerprint, index).nativeSegwit?.derivePayer({
        change: 0,
        addressIndex: 0,
      }).address ?? null,
    [accountIndexByPaymentType]
  );

  const getTaprootAddress = useCallback(
    (fingerprint: string, index: number) =>
      accountIndexByPaymentType(fingerprint, index).taproot?.derivePayer({
        change: 0,
        addressIndex: 0,
      }).address ?? null,
    [accountIndexByPaymentType]
  );

  const getStacksSignerAddress = useCallback(
    (fingerprint: string, index: number) =>
      fromAccountIndex(fingerprint, index)[0]?.address ?? null,
    [fromAccountIndex]
  );

  const accountsWithAddresses = useMemo(
    () =>
      accounts.map(account => ({
        ...account,
        addresses: [
          getSegwitAddress(account.fingerprint, account.accountIndex),
          getTaprootAddress(account.fingerprint, account.accountIndex),
          getStacksSignerAddress(account.fingerprint, account.accountIndex),
        ],
      })),
    [accounts, getSegwitAddress, getTaprootAddress, getStacksSignerAddress]
  );

  const findAccountByAddress = useCallback(
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
    findAccountByAddress,
    getAddressByAccount: asset.chain === 'stacks' ? getStacksSignerAddress : getSegwitAddress,
  };
}
