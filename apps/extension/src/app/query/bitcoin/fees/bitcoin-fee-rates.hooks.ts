import { useQuery } from '@tanstack/react-query';

import { createBitcoinFeeRatesQueryConfig } from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';

interface BitcoinFeeRatesData {
  high: { rate: number };
  standard: { rate: number };
  low: { rate: number };
}

export function useBitcoinFeeRates() {
  const settings = useUserSettings();
  return useQuery<BitcoinFeeRatesData>(createBitcoinFeeRatesQueryConfig(settings));
}
