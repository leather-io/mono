import { useMemo } from 'react';

import { Account } from '@/store/accounts/accounts';
import { useAccounts } from '@/store/accounts/accounts.read';
import { AccountStatus } from '@/store/accounts/utils';
import {
  useBitcoinAccounts,
  useBitcoinPayerAddressFromAccountIndex,
} from '@/store/keychains/bitcoin/bitcoin-keychains.read';
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
        ).map(accountIndex => {
          const baseAddresses = createAccountAddresses(
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
          );

          if (!baseAddresses.bitcoin) return baseAddresses;

          const { nativeSegwit, taproot } = bitcoinAccounts.accountIndexByPaymentType(
            wallet.fingerprint,
            accountIndex
          );

          return {
            ...baseAddresses,
            bitcoin: {
              ...baseAddresses.bitcoin,
              zeroIndexTaprootPayerAddress:
                taproot?.derivePayer({ change: 0, addressIndex: 0 }).address ?? '',
              zeroIndexNativeSegwitPayerAddress:
                nativeSegwit?.derivePayer({ change: 0, addressIndex: 0 }).address ?? '',
            },
          };
        });
      });
}

function deriveAccountAddresses(
  fingerprint: string,
  accountIndex: number,
  keychains: BitcoinAccountsFromAccountIndex,
  stxAddress?: string,
  taprootPayerAddress?: string,
  nativeSegwitPayerAddress?: string
): AccountAddresses {
  const baseAddresses = createAccountAddresses(
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

  if (baseAddresses.bitcoin?.type !== 'hd') return baseAddresses;

  return {
    ...baseAddresses,
    bitcoin: {
      ...baseAddresses.bitcoin,
      zeroIndexTaprootPayerAddress: taprootPayerAddress,
      zeroIndexNativeSegwitPayerAddress: nativeSegwitPayerAddress,
    },
  };
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

export function useTotalAccountAddresses(status: AccountStatus = 'active') {
  const wallets = useWallets();
  const bitcoinAccounts = useBitcoinAccounts();
  const stacksSigners = useStacksSigners();
  const accounts = useAccounts(status);

  return useMemo(
    () =>
      filterAccountsByActiveAccounts(
        deriveTotalAccountAddresses(wallets, bitcoinAccounts, stacksSigners),
        accounts.list
      ),
    [wallets, bitcoinAccounts, stacksSigners, accounts]
  );
}

export function useAccountAddresses(fingerprint: string, accountIndex: number) {
  const keychains = useBitcoinAccounts().fromAccountIndex(fingerprint, accountIndex);
  const stxAddress = useStacksSignerAddressFromAccountIndex(fingerprint, accountIndex);
  const { taprootPayerAddress, nativeSegwitPayerAddress } = useBitcoinPayerAddressFromAccountIndex(
    fingerprint,
    accountIndex
  );

  return useMemo(
    () =>
      deriveAccountAddresses(
        fingerprint,
        accountIndex,
        keychains,
        stxAddress,
        taprootPayerAddress,
        nativeSegwitPayerAddress
      ),
    [
      keychains,
      stxAddress,
      fingerprint,
      accountIndex,
      taprootPayerAddress,
      nativeSegwitPayerAddress,
    ]
  );
}
