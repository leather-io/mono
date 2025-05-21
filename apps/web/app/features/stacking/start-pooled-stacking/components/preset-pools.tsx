import { ReactElement } from 'react';

export interface PoolRewardProtocolInfo {
  id: string;
  url?: string;
  logo: ReactElement;
  title: string;
  description: string;
  tvl: string | null;
  tvlUsd: string | null;
  minCommitment: number;
  minCommitmentUsd: string;
  apr: string | null;
  rewardsToken: string;
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
