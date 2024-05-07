import {
  calculateMeanAverage,
  initBigNumber,
  isFulfilled,
  isRejected,
} from '@leather-wallet/utils';

import { useGetAllBitcoinFeeEstimatesQuery } from './fee-estimates.query';

export function useAverageBitcoinFeeRates() {
  return useGetAllBitcoinFeeEstimatesQuery({
    select(feeEstimates) {
      if (feeEstimates.every(isRejected)) {
        return {
          fastestFee: initBigNumber(15),
          halfHourFee: initBigNumber(10),
          hourFee: initBigNumber(5),
        };
      }

      const fees = feeEstimates.filter(isFulfilled).map(result => result.value);

      return {
        fastestFee: calculateMeanAverage(fees.map(fee => fee.fast)).decimalPlaces(0),
        halfHourFee: calculateMeanAverage(fees.map(fee => fee.medium)).decimalPlaces(0),
        hourFee: calculateMeanAverage(fees.map(fee => fee.slow)).decimalPlaces(0),
      };
    },
  });
}
