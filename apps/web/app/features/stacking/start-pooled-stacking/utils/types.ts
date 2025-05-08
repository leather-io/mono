import { NetworkMode } from './stacking-pool-types';

// TODO: Replace with StackingPoolFormSchema
export interface StackingFormValues {
  amount: number;
  rewardAddress: string;
  providerId: string;
  poolAddress: string;
  delegationDurationType?: string;
  numberOfCycles: number;
}

export interface PresetPool {
  logoUrl: string;
  poolAddress: string;
  description: string;
  website: string;
  duration: number;
  payoutMethod: 'BTC' | 'STX';
}

export type PoolWrapperAllowanceState = Partial<{
  [key in NetworkMode]: Partial<{ [K in string]: boolean }>;
}>;
