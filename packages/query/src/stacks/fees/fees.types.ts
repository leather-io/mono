export interface StacksFeeEstimationRange {
  min: number;
  max: number;
}

export interface DefaultMinMaxRangeFeeEstimations {
  low: StacksFeeEstimationRange;
  standard: StacksFeeEstimationRange;
  high: StacksFeeEstimationRange;
}
