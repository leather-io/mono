import { useMemo } from 'react';

import { type SupportedPaymentType, deriveBitcoinPayerFromAccount } from '@leather.io/bitcoin';
import { createNullArrayOfLength, isDefined } from '@leather.io/utils';

import { useCurrentAccountId } from '@app/store/accounts/account';
import { useBitcoinAccountLookup } from '@app/store/accounts/blockchain/bitcoin/bitcoin-keychain';
import { useStacksAccounts } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentNetworkId } from '@app/store/networks/networks.selectors';
import type { MonitoredAddress } from '@background/monitors/address-monitor';

const paymentTypes: SupportedPaymentType[] = ['p2wpkh', 'p2tr'];

export function useMonitorableAddresses() {
  const currentAccount = useCurrentAccountId();
  const currentNetworkId = useCurrentNetworkId();
  const bitcoinAccountLookup = useBitcoinAccountLookup();
  const stacksAccounts = useStacksAccounts();

  return useMemo(() => {
    if (!stacksAccounts || !currentNetworkId) return;

    const stacksAddresses = stacksAccounts.map(
      account =>
        ({
          accountIndex: account.index,
          address: account.address,
          chain: 'stacks',
          isCurrent: account.index === currentAccount.accountIndex,
        }) satisfies MonitoredAddress
    );

    const btcAddresses = createNullArrayOfLength(stacksAccounts.length).flatMap((_, index) => {
      const getAccount = bitcoinAccountLookup(currentAccount.fingerprint);
      return paymentTypes
        .map(paymentType => {
          const account = getAccount({
            paymentType,
            network: 'mainnet',
            accountIndex: index,
          });
          if (!account) return undefined;
          const payer = deriveBitcoinPayerFromAccount(
            account.descriptor,
            'mainnet'
          )({
            change: 0,
            addressIndex: 0,
          });
          return {
            accountIndex: index,
            address: payer.address,
            chain: 'bitcoin',
            isCurrent: index === currentAccount.accountIndex,
          } satisfies MonitoredAddress;
        })
        .filter(isDefined);
    });

    return (stacksAddresses.length === 0 && btcAddresses.length > 0) ||
      (btcAddresses.length === 0 && stacksAddresses.length > 0)
      ? undefined
      : [...stacksAddresses, ...btcAddresses];
  }, [bitcoinAccountLookup, stacksAccounts, currentNetworkId, currentAccount]);
}
