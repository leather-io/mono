import { useMemo } from 'react';

import { useAccounts, useAccountsByFingerprint } from '@/store/accounts/accounts.read';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import {
  useStacksSignerAddressFromAccountIndex,
  useStacksSigners,
} from '@/store/keychains/stacks/stacks-keychains.read';
import { useWallets } from '@/store/wallets/wallets.read';

import { getDescriptorFromKeychain } from '@leather.io/bitcoin';
import { decomposeDescriptor } from '@leather.io/crypto';
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
  stacksSigners?: StacksSigners,
  accounts?: string[]
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
              .filter(
                key =>
                  extractAccountIndexFromPath(key.keyOrigin) === accountIndex &&
                  accounts?.includes(key.keyOrigin)
              )
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

const accounts = {
  fromAccountIndex: null,
  fromFingerprint: null,
  hasAccounts: true,
  list: [
    {
      accountIndex: 0,
      fingerprint: 'efd01538',
      icon: 'sparkles',
      id: 'efd01538/0',
      name: 'Account 1',
      status: 'active',
    },
    {
      accountIndex: 0,
      fingerprint: 'b01c7e59',
      icon: 'car',
      id: 'b01c7e59/0',
      name: 'Account 1',
      status: 'active',
    },
  ],
};

const stacksSigners = {
  fromAccountId: null,
  fromAccountIndex: null,
  fromFingerprint: null,
  list: [
    {
      accountIndex: 0,
      address: 'SP2417H88DQFN7FNDMSKM9N0B3Q6GNGEM40W7ZAZW',
      derivationPath: "m/44'/5757'/0'/0/0",
      descriptor:
        "[efd01538/44'/5757'/0'/0/0]03f83a833e6fc370ec2616b5f8415ef4f0bad22249015c79b53a44f70ab210df50",
      fingerprint: 'efd01538',
      keyOrigin: "efd01538/44'/5757'/0'/0/0",
      network: 'mainnet',
      publicKey: null,
      sign: null,
      signMessage: null,
      signStructuredMessage: null,
    },
    {
      accountIndex: 1,
      address: 'SPY0682ZM7VGPMVGQP99Z05J3QWMVV83RA6N42SA',
      derivationPath: "m/44'/5757'/0'/0/1",
      descriptor:
        "[efd01538/44'/5757'/0'/0/1]02d21d6305bcb51584ea0d3405aff061dcaef4fe2a362abd4caf1ce7ba36a7c183",
      fingerprint: 'efd01538',
      keyOrigin: "efd01538/44'/5757'/0'/0/1",
      network: 'mainnet',
      publicKey: null,
      sign: null,
      signMessage: null,
      signStructuredMessage: null,
    },
    {
      accountIndex: 0,
      address: 'SP1EAE0J79Y9YHWHVWD6DEP6YFRV23YTRZFTP11FB',
      derivationPath: "m/44'/5757'/0'/0/0",
      descriptor:
        "[b01c7e59/44'/5757'/0'/0/0]03e56babfb92d46552543dd5c91b552235b351e9efc52681a2826be00da94c4887",
      fingerprint: 'b01c7e59',
      keyOrigin: "b01c7e59/44'/5757'/0'/0/0",
      network: 'mainnet',
      publicKey: null,
      sign: null,
      signMessage: null,
      signStructuredMessage: null,
    },
  ],
};

const bitcoinAccounts = {
  accountIndexByPaymentType: null,
  fromAccountId: null,
  fromAccountIndex: null,
  fromFingerprint: null,
  list: [
    {
      derivePayer: null,
      descriptor:
        "[efd01538/84'/0'/0']xpub6CxzM41aUbKigFCifZxs9wkX37SMm5qRFqYjk1VdUZtwK3a5YoNnqZuNe29xycKLLThEEXDaKLLhke2Kwi2xKhrj14mwCCyzBGChGcaJH9L",
      keyOrigin: "efd01538/84'/0'/0'",
      keychain: null,
      masterKeyFingerprint: 'efd01538',
      xpub: 'xpub6CxzM41aUbKigFCifZxs9wkX37SMm5qRFqYjk1VdUZtwK3a5YoNnqZuNe29xycKLLThEEXDaKLLhke2Kwi2xKhrj14mwCCyzBGChGcaJH9L',
    },
    {
      derivePayer: null,
      descriptor:
        "[efd01538/86'/0'/0']xpub6CXPXMfXcvsrKobgiqZJm1XdW4HBEB7dM1FfpZmbWjmU5yMp6npza7MD6Jd3xUJZCX9wy6cTiT1xTh7aE3aXDSzVRHFQVwG8SoKnwkW7QD2",
      keyOrigin: "efd01538/86'/0'/0'",
      keychain: null,
      masterKeyFingerprint: 'efd01538',
      xpub: 'xpub6CXPXMfXcvsrKobgiqZJm1XdW4HBEB7dM1FfpZmbWjmU5yMp6npza7MD6Jd3xUJZCX9wy6cTiT1xTh7aE3aXDSzVRHFQVwG8SoKnwkW7QD2',
    },
    {
      derivePayer: null,
      descriptor:
        "[efd01538/84'/0'/1']xpub6CxzM41aUbKii1poa7PmCz1C3NGvm1nHDpdNBRe36TE5kYExK7QYaGvUCNGA8Yj2S7WXYGxpnLwtaZH1s54aKSX4S3frDhfxQBQMsHR2sxg",
      keyOrigin: "efd01538/84'/0'/1'",
      keychain: null,
      masterKeyFingerprint: 'efd01538',
      xpub: 'xpub6CxzM41aUbKii1poa7PmCz1C3NGvm1nHDpdNBRe36TE5kYExK7QYaGvUCNGA8Yj2S7WXYGxpnLwtaZH1s54aKSX4S3frDhfxQBQMsHR2sxg',
    },
    {
      derivePayer: null,
      descriptor:
        "[efd01538/86'/0'/1']xpub6CXPXMfXcvsrQEGftzCCKDpqSjbJAzu5vWgD2hmd7sT33kwzRS23UzJy6z7RHVx12gUSCJ2L1qhmyKAsdyhxMeTP1RTS9Y7XMooPVQJnzRr",
      keyOrigin: "efd01538/86'/0'/1'",
      keychain: null,
      masterKeyFingerprint: 'efd01538',
      xpub: 'xpub6CXPXMfXcvsrQEGftzCCKDpqSjbJAzu5vWgD2hmd7sT33kwzRS23UzJy6z7RHVx12gUSCJ2L1qhmyKAsdyhxMeTP1RTS9Y7XMooPVQJnzRr',
    },
    {
      derivePayer: null,
      descriptor:
        "[b01c7e59/84'/0'/0']xpub6C6Qqzoz8TLaHU4r2pHeLCXTt2BigcjXR3ArYv26vzwbH92oTriN4X6UfVuNxALmQKjBEnemxeg3gmB9Rwrp5MDNHo2v2XTSGMsgjz9LUVM",
      keyOrigin: "b01c7e59/84'/0'/0'",
      keychain: null,
      masterKeyFingerprint: 'b01c7e59',
      xpub: 'xpub6C6Qqzoz8TLaHU4r2pHeLCXTt2BigcjXR3ArYv26vzwbH92oTriN4X6UfVuNxALmQKjBEnemxeg3gmB9Rwrp5MDNHo2v2XTSGMsgjz9LUVM',
    },
    {
      derivePayer: null,
      descriptor:
        "[b01c7e59/86'/0'/0']xpub6C6u5XA8n6K1JzhafiTuQtvzTWvEoN1BEWqQLHYaBC5uW16s3fL4AjXs6fPnziPjT1iJ9CEKXfRvWFDiscHAVdHhzD6GcyyTh7C4bfMeLQM",
      keyOrigin: "b01c7e59/86'/0'/0'",
      keychain: null,
      masterKeyFingerprint: 'b01c7e59',
      xpub: 'xpub6C6u5XA8n6K1JzhafiTuQtvzTWvEoN1BEWqQLHYaBC5uW16s3fL4AjXs6fPnziPjT1iJ9CEKXfRvWFDiscHAVdHhzD6GcyyTh7C4bfMeLQM',
    },
  ],
};

export function useTotalAccountAddresses() {
  const wallets = useWallets();
  const bitcoinAccounts = useBitcoinAccounts();
  const stacksSigners = useStacksSigners();
  const { list: accounts } = useAccounts('active');
  const activeFingerprint = accounts.map(account => account.fingerprint);

  const activeBitcoinAccounts = {
    ...bitcoinAccounts,
    list: bitcoinAccounts.list.filter(keychain =>
      activeFingerprint.includes(keychain.masterKeyFingerprint)
    ),
  };
  const activeStacksSigners = {
    ...stacksSigners,
    list: stacksSigners.list.filter(signer => {
      const { fingerprint } = decomposeDescriptor(signer.descriptor);
      return activeFingerprint.includes(fingerprint);
    }),
  };

  console.log('wallets', wallets);
  console.log('bitcoinAccounts', bitcoinAccounts);
  console.log('bitcoinAccounts', bitcoinAccounts.list.length);
  console.log('stacksSigners', stacksSigners.list.length);
  console.log('activeBitcoinAccounts', activeBitcoinAccounts.list.length);
  console.log('activeStacksSigners', activeStacksSigners.list.length);

  console.log('accounts', accounts);
  console.log('activeFingerprint', activeFingerprint);
  return useMemo(
    () =>
      deriveTotalAccountAddresses(wallets, activeBitcoinAccounts, activeStacksSigners, accounts),
    [wallets, activeBitcoinAccounts, activeStacksSigners, accounts]
  );
}

export function useWalletAccountAddresses(fingerprint: string) {
  const bitcoinAccounts = useBitcoinAccounts();
  const accountsByFingerprint = useAccountsByFingerprint(fingerprint);
  const stacksSigners = useStacksSigners();

  return useMemo(
    () =>
      deriveWalletAccountAddresses(
        fingerprint,
        bitcoinAccounts,
        accountsByFingerprint,
        stacksSigners
      ),
    [accountsByFingerprint, stacksSigners, bitcoinAccounts, fingerprint]
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
