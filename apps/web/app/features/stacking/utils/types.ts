import { NetworkInstance, PoolName, WrapperPrincipal } from './types-preset-pools';

interface DelegatingFormIndefiniteValues<N> {
  delegationDurationType: 'indefinite';
  amount: N;
  poolAddress: string;
  rewardAddress: string;
  poolName: PoolName | undefined;
}
interface DelegatingFormLimitedValues<N> {
  delegationDurationType: 'limited';
  amount: N;
  poolAddress: string;
  numberOfCycles: number;
  rewardAddress: string;
  poolName: PoolName | undefined;
}
type AbstractDelegatingFormValues<N> =
  | DelegatingFormIndefiniteValues<N>
  | DelegatingFormLimitedValues<N>;

export type EditingFormValues = AbstractDelegatingFormValues<string | number>;

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
