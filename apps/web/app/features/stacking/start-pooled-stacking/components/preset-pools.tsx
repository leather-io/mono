import { ReactElement } from 'react';

export type PoolRewardProtocolInfoRewardToken = 'STX' | 'BTC';

export interface PoolRewardProtocolInfo {
  id: string;
  url?: string;
  logo: ReactElement;
  title: string;
  description: string;
  allowCustomRewardAddress: boolean;
  tvl: string | null;
  tvlUsd: string | null;
  minCommitment: number;
  minCommitmentUsd: string;
  apr: string | null;
  rewardsToken: PoolRewardProtocolInfoRewardToken;
  status: string;
  poolAddress: string;
  rewardAddress: string | null;
  minLockupPeriodDays: number;
  nextCycleDays: number;
  nextCycleNumber: number;
  nextCycleBlocks: number;
  rewardTokenIcon: ReactElement;
}

export interface ActivePoolRewardProtocolInfo extends PoolRewardProtocolInfo {
  delegatedAmountMicroStx?: number | bigint;
  isStacking: boolean;
  isExpired: boolean;
}
