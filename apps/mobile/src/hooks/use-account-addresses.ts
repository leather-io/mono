import { useMemo } from 'react';

import { Account } from '@/store/accounts/accounts';
import { useAccounts, useAccountsByFingerprint } from '@/store/accounts/accounts.read';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import {
  useStacksSignerAddressFromAccountIndex,
  useStacksSigners,
} from '@/store/keychains/stacks/stacks-keychains.read';
import { useWallets } from '@/store/wallets/wallets.read';

import { getDescriptorFromKeychain } from '@leather.io/bitcoin';
import { extractAccountIndexFromPath } from '@leather.io/crypto';
import { AccountAddresses } from '@leather.io/models';
import { createAccountAddresses, isDefined, uniqueArray } from '@leather.io/utils';

type Wallets = ReturnType<typeof useWallets>;
type BitcoinAccounts = ReturnType<typeof useBitcoinAccounts>;
type StacksSigners = ReturnType<typeof useStacksSigners>;
type AccountsByFingerprint = ReturnType<typeof useAccountsByFingerprint>;
type BitcoinAccountsFromAccountIndex = ReturnType<BitcoinAccounts['fromAccountIndex']>;

function deriveTotalAccountAddresses(
  wallets?: Wallets,
  bitcoinAccounts?: BitcoinAccounts,
  stacksSigners?: StacksSigners
): AccountAddresses[] {
  return !wallets || !stacksSigners || !bitcoinAccounts
    ? []
    : wallets.list.flatMap(wallet => {
        const walletKeychains = bitcoinAccounts.list.filter(
          key => key.masterKeyFingerprint === wallet.fingerprint
        );
        return uniqueArray(
          walletKeychains.map(key => extractAccountIndexFromPath(key.keyOrigin))
        ).map(accountIndex =>
          createAccountAddresses(
            {
              fingerprint: wallet.fingerprint,
              accountIndex,
            },
            walletKeychains
              .filter(key => extractAccountIndexFromPath(key.keyOrigin) === accountIndex)
              .map(getDescriptorFromKeychain)
              .filter(isDefined),
            stacksSigners
              .fromAccountIndex(wallet.fingerprint, accountIndex)
              .map(signer => signer.address)[0]
          )
        );
      });
}

function deriveWalletAccountAddresses(
  fingerprint: string,
  bitcoinAccounts?: BitcoinAccounts,
  accountsByFingerprint?: AccountsByFingerprint,
  stacksSigners?: StacksSigners
): AccountAddresses[] {
  return !bitcoinAccounts || !stacksSigners || !accountsByFingerprint
    ? []
    : accountsByFingerprint.list
        .map(account => account.accountIndex)
        .map(accountIndex =>
          createAccountAddresses(
            { fingerprint, accountIndex },
            bitcoinAccounts.list
              .filter(
                keychain =>
                  keychain.masterKeyFingerprint === fingerprint &&
                  extractAccountIndexFromPath(keychain.keyOrigin) === accountIndex
              )
              .map(getDescriptorFromKeychain)
              .filter(isDefined),
            stacksSigners
              .fromAccountIndex(fingerprint, accountIndex)
              .map(signer => signer.address)[0]
          )
        );
}

function deriveAccountAddresses(
  fingerprint: string,
  accountIndex: number,
  keychains: BitcoinAccountsFromAccountIndex,
  stxAddress?: string
) {
  return createAccountAddresses(
    { fingerprint, accountIndex },
    keychains
      .filter(
        keychain =>
          keychain.masterKeyFingerprint === fingerprint &&
          extractAccountIndexFromPath(keychain.keyOrigin) === accountIndex
      )
      .map(getDescriptorFromKeychain)
      .filter(isDefined),
    stxAddress
  );
}

function filterAccountsByActiveAccounts(
  derivedAccountAddresses: AccountAddresses[],
  activeAccounts: Account[]
) {
  return derivedAccountAddresses.filter(account =>
    activeAccounts.some(
      active =>
        active.fingerprint === account.id.fingerprint &&
        active.accountIndex === account.id.accountIndex
    )
  );
}

export function useTotalAccountAddresses() {
  const wallets = useWallets();
  const bitcoinAccounts = useBitcoinAccounts();
  const stacksSigners = useStacksSigners();
  const activeAccounts = useAccounts();

  return useMemo(
    () =>
      filterAccountsByActiveAccounts(
        deriveTotalAccountAddresses(wallets, bitcoinAccounts, stacksSigners),
        activeAccounts.list
      ),
    [wallets, bitcoinAccounts, stacksSigners, activeAccounts]
  );
}

export function useWalletAccountAddresses(fingerprint: string) {
  const bitcoinAccounts = useBitcoinAccounts();
  const accountsByFingerprint = useAccountsByFingerprint(fingerprint);
  const stacksSigners = useStacksSigners();
  const activeAccounts = useAccounts();

  return useMemo(
    () =>
      filterAccountsByActiveAccounts(
        deriveWalletAccountAddresses(
          fingerprint,
          bitcoinAccounts,
          accountsByFingerprint,
          stacksSigners
        ),
        activeAccounts.list
      ),
    [accountsByFingerprint, stacksSigners, bitcoinAccounts, fingerprint, activeAccounts]
  );
}

export function useAccountAddresses(fingerprint: string, accountIndex: number) {
  const keychains = useBitcoinAccounts().fromAccountIndex(fingerprint, accountIndex);
  const stxAddress = useStacksSignerAddressFromAccountIndex(fingerprint, accountIndex);

  return useMemo(
    () => deriveAccountAddresses(fingerprint, accountIndex, keychains, stxAddress),
    [keychains, stxAddress, fingerprint, accountIndex]
  );
}
