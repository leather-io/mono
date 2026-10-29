import { useUserSettings } from '@/hooks/use-user-settings';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';

import { type AverageBitcoinFeeRates } from '@leather.io/models';
import { createBitcoinFeeRatesQueryConfig } from '@leather.io/queries';
import { initBigNumber } from '@leather.io/utils';

export function useAverageBitcoinFeeRates(): UseQueryResult<AverageBitcoinFeeRates> {
  const settings = useUserSettings();

  return useQuery({
    ...createBitcoinFeeRatesQueryConfig(settings),
    select(feeRates) {
      return {
        fastestFee: initBigNumber(feeRates.high.rate),
        halfHourFee: initBigNumber(feeRates.standard.rate),
        hourFee: initBigNumber(feeRates.low.rate),
      };
    },
  });
}
