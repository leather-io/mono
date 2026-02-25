import { useQuery } from '@tanstack/react-query';

import {
  type BitcoinTransactionFeesParams,
  createBitcoinTransactionFeesQueryConfig,
} from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';

interface UseBitcoinTransactionFeesArgs extends BitcoinTransactionFeesParams {
  enabled?: boolean;
}

export function useBitcoinTransactionFees({
  account,
  recipients,
  isMaxSpend,
  enabled = true,
}: UseBitcoinTransactionFeesArgs) {
  const settings = useUserSettings();
  return useQuery({
    ...createBitcoinTransactionFeesQueryConfig({ account, recipients, isMaxSpend }, settings),
    enabled,
  });
}
