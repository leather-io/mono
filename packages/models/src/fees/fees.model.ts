import { Blockchain } from '../types';
import { StacksFeeEstimate } from './stacks-fees.model';

export enum FeeTypes {
  Low,
  Middle,
  High,
  Custom,
  Unknown,
}

export enum FeeCalculationTypes {
  Api = 'api',
  Default = 'default',
  DefaultSimulated = 'default-simulated',
  FeesCapped = 'fees-capped',
  TokenTransferSpecific = 'token-transfer-specific',
}

export interface Fees {
  blockchain: Blockchain;
  estimates: StacksFeeEstimate[];
  calculation: FeeCalculationTypes;
}
