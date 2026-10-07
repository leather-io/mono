import { useQuery } from '@tanstack/react-query';
import { useUserSettings } from '~/hooks/use-user-settings';

import type { Money, VaultAccount } from '@leather.io/models';
import { getBitcoinCoinSelectionService } from '@leather.io/services';

import { createMultisigAccountAddresses } from '../vaults/multisig-account-addresses';

interface UseVaultBtcCustomFeeArgs {
  account: VaultAccount;
  recipient?: string;
  amount?: Money;
  feeRate?: number;
}

export function useVaultBtcCustomFee({
  account,
  recipient,
  amount,
  feeRate,
}: UseVaultBtcCustomFeeArgs) {
  const settings = useUserSettings();
  return useQuery({
    queryKey: ['multisig-btc-custom-fee', account, recipient, amount, feeRate, settings.network.id],
    queryFn: ({ signal }) => {
      if (!recipient || !amount || feeRate === undefined)
        throw new Error('Missing transaction details');
      return getBitcoinCoinSelectionService().performCoinSelection(
        {
          account: { account: createMultisigAccountAddresses(account) },
          recipients: [{ address: recipient, amount }],
          feeRate,
        },
        signal
      );
    },
    enabled: !!recipient && !!amount && feeRate !== undefined,
    retry: false,
  });
}
