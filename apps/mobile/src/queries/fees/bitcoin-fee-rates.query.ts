import { useUserSettings } from '@/hooks/use-user-settings';
import { useQuery } from '@tanstack/react-query';

import { createBitcoinFeeRatesQueryConfig } from '@leather.io/queries';

export interface BitcoinFeeRates {
  low: { rate: number };
  standard: { rate: number };
  high: { rate: number };
}

export function useBitcoinFeeRates() {
  const settings = useUserSettings();
  return useQuery<BitcoinFeeRates>(createBitcoinFeeRatesQueryConfig(settings));
}
