import { ReactElement } from 'react';

import { AlexLogo } from '~/components/icons/alex-logo';

export interface PoolRewardProtocolInfo {
  id: string;
  url?: string;
  logo: ReactElement;
  title: string;
  description: string;
  tvl: string;
  tvlUsd: string;
  minCommitment: string;
  minCommitmentUsd: string;
  apr: string;
  rewardsToken: string;
  status: string;
  poolAddress: string;
  rewardAddress: string;
  minLockupPeriodDays: number;
  nextCycleDays: number;
  nextCycleNumber: number;
  nextCycleBlocks: number;
}

export const dummyPoolRewardProtocol: PoolRewardProtocolInfo = {
  id: 'alex',
  url: 'https://app.alexlab.co/pool',
  logo: <AlexLogo size="32px" />,
  title: 'ALEX',
  description:
    'Commit sBTC to liquidity pools to earn fees and LP tokens in addition to basic sBTC rewards',
  tvl: '1,880 BTC',
  tvlUsd: '$113,960,000',
  minCommitment: '0.01 BTC',
  minCommitmentUsd: '$605.00',
  apr: '5.2%',
  rewardsToken: 'sBTC',
  status: 'Active',
  poolAddress: 'SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP.pox4-fast-pool-v3',
  rewardAddress: 'bc1qlhcff79xqk2vu7yjn50wzgdxtjfxs7jmkjmnwx',
  nextCycleBlocks: 234,
  nextCycleNumber: 104,
  nextCycleDays: 2,
  minLockupPeriodDays: 15,
};
