import { NetworkInstance, PoolName, WrapperPrincipal } from './types-preset-pools';

export interface StackingFormValues {
  amount: string | number;
  rewardAddress: string;
  // TODO: should we remove these fields?
  poolName?: PoolName;
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
  [key in NetworkInstance]: Partial<{ [K in WrapperPrincipal]: boolean }>;
}>;
