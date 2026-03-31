import { useMemo } from 'react';

import { deriveBitcoinPayerFromAccount } from '@leather.io/bitcoin';
import type { AccountId } from '@leather.io/models';
import { createAccountAddresses } from '@leather.io/utils';

import { useBitcoinAccountXpubs } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useNativeSegwitAccount } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useTaprootAccount } from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';
import { useStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

export function useAccountAddresses(accountId: AccountId) {
  const accountXpubs = useBitcoinAccountXpubs(accountId);
  const stxAccount = useStacksAccount(accountId);
  const nativeSegwitAccount = useNativeSegwitAccount(accountId);
  const taprootAccount = useTaprootAccount(accountId);
  const network = useCurrentNetwork();

  return useMemo(() => {
    const baseAddresses = createAccountAddresses(accountId, accountXpubs, stxAccount?.address);

    if (!baseAddresses.bitcoin) return baseAddresses;

    const nativeSegwitAddress = nativeSegwitAccount
      ? deriveBitcoinPayerFromAccount(
          nativeSegwitAccount.descriptor,
          network.chain.bitcoin.mode
        )({ change: 0, addressIndex: 0 }).address
      : '';

    const taprootAddress = taprootAccount
      ? deriveBitcoinPayerFromAccount(
          taprootAccount.descriptor,
          network.chain.bitcoin.mode
        )({ change: 0, addressIndex: 0 }).address
      : '';

    return {
      ...baseAddresses,
      bitcoin: {
        ...baseAddresses.bitcoin,
        zeroIndexNativeSegwitPayerAddress: nativeSegwitAddress,
        zeroIndexTaprootPayerAddress: taprootAddress,
      },
    };
  }, [accountXpubs, stxAccount, accountId, nativeSegwitAccount, taprootAccount, network]);
}
