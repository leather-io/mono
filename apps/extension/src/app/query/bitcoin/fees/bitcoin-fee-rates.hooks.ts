import { useQuery } from '@tanstack/react-query';

import { createBitcoinFeeRatesQueryConfig } from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';

export function useBitcoinFeeRates() {
  const settings = useUserSettings();
  return useQuery(createBitcoinFeeRatesQueryConfig(settings));
}
