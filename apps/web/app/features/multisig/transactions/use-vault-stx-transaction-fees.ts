import { useQuery } from '@tanstack/react-query';
import { useUserSettings } from '~/hooks/use-user-settings';

import type { Money, VaultAccount } from '@leather.io/models';
import { createStacksTransactionFeesQueryConfig } from '@leather.io/queries';

import { buildUnsignedMultisigStxTransfer } from './build-stx-transfer';

interface UseVaultStxTransactionFeesArgs {
  account?: VaultAccount;
  recipient?: string;
  amount?: Money;
}

export function useVaultStxTransactionFees({
  account,
  recipient,
  amount,
}: UseVaultStxTransactionFeesArgs) {
  const settings = useUserSettings();

  const draftQuery = useQuery({
    queryKey: ['multisig-stx-fee-draft', account, recipient, amount],
    queryFn: () => {
      if (!account || !recipient || !amount) throw new Error('Missing transaction details');
      return buildUnsignedMultisigStxTransfer({ account, recipient, amount });
    },
    enabled: !!account && !!recipient && !!amount,
  });

  const draftTx = draftQuery.data;
  const feesConfig = draftTx
    ? createStacksTransactionFeesQueryConfig(draftTx, settings)
    : {
        queryKey: ['multisig-stx-transaction-fees-disabled'],
        queryFn: () => Promise.reject(new Error('No draft transaction')),
      };

  const feesQuery = useQuery({ ...feesConfig, enabled: !!draftTx });

  return {
    data: feesQuery.data,
    error: draftQuery.error ?? feesQuery.error,
    isFetching: draftQuery.isFetching || feesQuery.isFetching,
  };
}
