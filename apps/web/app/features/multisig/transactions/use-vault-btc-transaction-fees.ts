import { useQuery } from '@tanstack/react-query';
import { useUserSettings } from '~/hooks/use-user-settings';

import type { Money, VaultAccount } from '@leather.io/models';
import { createBitcoinTransactionFeesQueryConfig } from '@leather.io/queries';

import { createMultisigAccountAddresses } from '../vaults/multisig-account-addresses';

interface UseVaultBtcTransactionFeesArgs {
  account?: VaultAccount;
  recipient?: string;
  amount?: Money;
}

export function useVaultBtcTransactionFees({
  account,
  recipient,
  amount,
}: UseVaultBtcTransactionFeesArgs) {
  const settings = useUserSettings();

  const config =
    account && recipient && amount
      ? createBitcoinTransactionFeesQueryConfig(
          {
            account: { account: createMultisigAccountAddresses(account) },
            recipients: [{ address: recipient, amount }],
          },
          settings
        )
      : {
          queryKey: ['multisig-btc-transaction-fees-disabled'],
          queryFn: () => Promise.reject(new Error('Missing transaction details')),
        };

  return useQuery({ ...config, enabled: !!account && !!recipient && !!amount });
}
