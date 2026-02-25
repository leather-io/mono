import { useUserSettings } from '@/hooks/use-user-settings';
import { useQuery } from '@tanstack/react-query';

import { createBitcoinFeeRatesQueryConfig } from '@leather.io/queries';

export function useBitcoinFeeRates() {
  const settings = useUserSettings();
  return useQuery(createBitcoinFeeRatesQueryConfig(settings));
}
