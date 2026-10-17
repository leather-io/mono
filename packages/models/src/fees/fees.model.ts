import { type Blockchain } from '../types';
import { type StacksFeeEstimate } from './stacks-fees.model';

interface FeeTypesMap {
  readonly Low: 0;
  readonly Middle: 1;
  readonly High: 2;
  readonly Custom: 3;
  readonly Unknown: 4;
  readonly [index: number]: string;
}

export const FeeTypes: FeeTypesMap = {
  Low: 0,
  Middle: 1,
  High: 2,
  Custom: 3,
  Unknown: 4,
  0: 'Low',
  1: 'Middle',
  2: 'High',
  3: 'Custom',
  4: 'Unknown',
};
export type FeeTypes = FeeTypesMap['Low' | 'Middle' | 'High' | 'Custom' | 'Unknown'];

export const FeeCalculationTypes = {
  Api: 'api',
  Default: 'default',
  DefaultSimulated: 'default-simulated',
  FeesCapped: 'fees-capped',
  TokenTransferSpecific: 'token-transfer-specific',
} as const;
export type FeeCalculationTypes = (typeof FeeCalculationTypes)[keyof typeof FeeCalculationTypes];

export interface Fees {
  blockchain: Blockchain;
  estimates: StacksFeeEstimate[];
  calculation: FeeCalculationTypes;
}
