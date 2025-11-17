import { useMemo, useSyncExternalStore } from 'react';

import {
  deriveAddressIndexZeroFromAccount,
  getNativeSegwitPaymentFromAddressIndex,
  getTaprootPaymentFromAddressIndex,
} from '@leather.io/bitcoin';
import { createAccountAddresses } from '@leather.io/utils';

import { useBitcoinAccountXpubs } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useNativeSegwitAccount } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useTaprootAccount } from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';
import { useStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

export function useAccountAddresses(accountIndex: number) {
  const accountXpubs = useBitcoinAccountXpubs(accountIndex);
  const stxAccount = useStacksAccount(accountIndex);
  const nativeSegwitAccount = useNativeSegwitAccount(accountIndex);
  const taprootAccount = useTaprootAccount(accountIndex);

  return useMemo(() => {
    const baseAddresses = createAccountAddresses(
      { fingerprint: 'master', accountIndex },
      accountXpubs,
      stxAccount?.address
    );

    if (!baseAddresses.bitcoin) return baseAddresses;

    const nativeSegwitAddress = nativeSegwitAccount
      ? getNativeSegwitPaymentFromAddressIndex(
          deriveAddressIndexZeroFromAccount(nativeSegwitAccount.keychain),
          nativeSegwitAccount.network
        ).address
      : '';

    const taprootAddress = taprootAccount
      ? getTaprootPaymentFromAddressIndex(
          deriveAddressIndexZeroFromAccount(taprootAccount.keychain),
          taprootAccount.network
        ).address
      : '';

    return {
      ...baseAddresses,
      bitcoin: {
        ...baseAddresses.bitcoin,
        zeroIndexNativeSegwitPayerAddress: nativeSegwitAddress,
        zeroIndexTaprootPayerAddress: taprootAddress,
      },
    };
  }, [accountXpubs, stxAccount, accountIndex, nativeSegwitAccount, taprootAccount]);
}
