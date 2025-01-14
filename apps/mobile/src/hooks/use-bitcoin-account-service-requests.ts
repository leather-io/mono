import { useMemo } from 'react';

import { useAccountsByFingerprint } from '@/store/accounts/accounts.read';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useWallets } from '@/store/wallets/wallets.read';

import { inferPaymentTypeFromPath } from '@leather.io/bitcoin';
import { extractAccountIndexFromPath } from '@leather.io/crypto';
import { UtxoId } from '@leather.io/models';
import { isDefined, uniqueArray } from '@leather.io/utils';

function getDescriptorFromKeychain<T extends { keyOrigin: string; xpub: string }>(
  accountKeychain: T
) {
  switch (inferPaymentTypeFromPath(accountKeychain.keyOrigin)) {
    case 'p2tr':
      return `tr(${accountKeychain.xpub})`;
    case 'p2wpkh':
      return `wpkh(${accountKeychain.xpub})`;
    default:
      return undefined;
  }
}

function createBitcoinAccountIdentifier(
  fingerprint: string,
  accountIndex: number,
  descriptors: string[]
) {
  return {
    fingerprint,
    accountIndex,
    taprootDescriptor: descriptors.find(desc => desc.startsWith('tr(')) ?? '',
    nativeSegwitDescriptor: descriptors.find(desc => desc.startsWith('wpkh(')) ?? '',
  };
}

export function useTotalBitcoinAccountServiceRequests() {
  const wallets = useWallets();
  const keychains = useBitcoinAccounts();

  return useMemo(
    () =>
      wallets.list.flatMap(wallet => {
        const walletKeychains = keychains.list.filter(
          key => key.masterKeyFingerprint === wallet.fingerprint
        );
        return uniqueArray(
          walletKeychains.map(key => extractAccountIndexFromPath(key.keyOrigin))
        ).map(accountIndex => ({
          account: createBitcoinAccountIdentifier(
            wallet.fingerprint,
            accountIndex,
            walletKeychains
              .filter(key => extractAccountIndexFromPath(key.keyOrigin) === accountIndex)
              .map(getDescriptorFromKeychain)
              .filter(isDefined)
          ),
          unprotectedUtxos: [] as UtxoId[],
        }));
      }),
    [wallets.list, keychains.list]
  );
}

export function useWalletBitcoinAccountServiceRequests(fingerprint: string) {
  const keychains = useBitcoinAccounts();
  const accounts = useAccountsByFingerprint(fingerprint);

  return useMemo(() => {
    return accounts.list
      .map(account => account.accountIndex)
      .map(accountIndex => ({
        account: createBitcoinAccountIdentifier(
          fingerprint,
          accountIndex,
          keychains.list
            .filter(
              keychain =>
                keychain.masterKeyFingerprint === fingerprint &&
                extractAccountIndexFromPath(keychain.keyOrigin) === accountIndex
            )
            .map(getDescriptorFromKeychain)
            .filter(isDefined)
        ),
        unprotectedUtxos: [] as UtxoId[],
      }));
  }, [accounts.list, keychains.list, fingerprint]);
}

export function useBitcoinAccountServiceRequest(fingerprint: string, accountIndex: number) {
  const keychains = useBitcoinAccounts().fromAccountIndex(fingerprint, accountIndex);
  return useMemo(
    () => ({
      account: createBitcoinAccountIdentifier(
        fingerprint,
        accountIndex,
        keychains
          .filter(
            keychain =>
              keychain.masterKeyFingerprint === fingerprint &&
              extractAccountIndexFromPath(keychain.keyOrigin) === accountIndex
          )
          .map(getDescriptorFromKeychain)
          .filter(isDefined)
      ),
      unprotectedUtxos: [] as UtxoId[],
    }),
    [keychains, fingerprint, accountIndex]
  );
}
