import {
  calculateMeanAverage,
  initBigNumber,
  isFulfilled,
  isRejected,
} from '@leather-wallet/utils';

import { useGetAllBitcoinFeeEstimatesQuery } from './fee-estimates.query';

export function useAverageBitcoinFeeRates() {
  // const analytics = useAnalytics();
  return useGetAllBitcoinFeeEstimatesQuery({
    // onError: err => logger.error('Error getting all apis bitcoin fee estimates', { err }),
    select(feeEstimates) {
      if (feeEstimates.every(isRejected)) {
        // void analytics.track('error_using_fallback_bitcoin_fees');
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
