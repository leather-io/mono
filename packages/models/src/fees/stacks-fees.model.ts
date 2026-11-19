import { type Money } from '../money.model';

export interface StacksFeeEstimate {
  fee: Money;
  feeRate: number;
}
