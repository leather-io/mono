import { useCallback } from 'react';

import { bytesToHex } from '@noble/hashes/utils';

import { type SupportedPaymentType, deriveBitcoinPayerFromAccount } from '@leather.io/bitcoin';
import type { BitcoinNetworkModes } from '@leather.io/models';

import { useCurrentAccountId } from '@app/store/accounts/account';
import { useBitcoinAccountLookup } from '@app/store/accounts/blockchain/bitcoin/bitcoin-keychain';

export function useGetLegacyAuthBitcoinAddresses() {
  const currentAccount = useCurrentAccountId();
  const bitcoinAccountLookup = useBitcoinAccountLookup();

  return useCallback(
    (accountIndex: number) => {
      const getAccount = bitcoinAccountLookup(currentAccount.fingerprint);

      function getAccountDetails(paymentType: SupportedPaymentType, network: BitcoinNetworkModes) {
        const account = getAccount({ paymentType, network, accountIndex });
        if (!account) return undefined;
        return deriveBitcoinPayerFromAccount(
          account.descriptor,
          network
        )({ change: 0, addressIndex: 0 });
      }

      const p2wpkhMainnet = getAccountDetails('p2wpkh', 'mainnet');
      const p2wpkhTestnet = getAccountDetails('p2wpkh', 'testnet');
      const p2trMainnet = getAccountDetails('p2tr', 'mainnet');
      const p2trTestnet = getAccountDetails('p2tr', 'testnet');

      return {
        btcAddress: {
          p2tr: {
            mainnet: p2trMainnet?.address,
            testnet: p2trTestnet?.address,
            regtest: getAccountDetails('p2tr', 'regtest')?.address,
            signet: getAccountDetails('p2tr', 'signet')?.address,
          },
          p2wpkh: {
            mainnet: p2wpkhMainnet?.address,
            testnet: p2wpkhTestnet?.address,
            regtest: getAccountDetails('p2wpkh', 'regtest')?.address,
            signet: getAccountDetails('p2wpkh', 'signet')?.address,
          },
        },
        btcPublicKey: {
          p2tr: p2trMainnet?.publicKey ? bytesToHex(p2trMainnet.publicKey) : undefined,
          p2wpkh: p2wpkhMainnet?.publicKey ? bytesToHex(p2wpkhMainnet.publicKey) : undefined,
        },
        btcPublicKeyTestnet: {
          p2tr: p2trTestnet?.publicKey ? bytesToHex(p2trTestnet.publicKey) : undefined,
          p2wpkh: p2wpkhTestnet?.publicKey ? bytesToHex(p2wpkhTestnet.publicKey) : undefined,
        },
      };
    },
    [currentAccount.fingerprint, bitcoinAccountLookup]
  );
}
