import { ReactElement } from 'react';

import { DummyIcon } from '~/components/dummy';
import { AlexLogo } from '~/components/icons/alex-logo';
import { ImgFillLoader } from '~/components/img-loader';
import { MIN_DELEGATED_STACKING_AMOUNT_USTX } from '~/constants/constants';
import {
  NetworkInstanceToPoxContractMap,
  Pool,
  PoolName,
} from '~/features/stacking/start-pooled-stacking/utils/types-preset-pools';

export const pools: Record<PoolName, Pool> = {
  'FAST Pool': {
    name: 'FAST Pool',
    description:
      'Enjoy automatic pool operations.' +
      ' ' +
      'You can increase the locking amount for the next cycle.' +
      ' ' +
      'Locked STX will unlock 1 day after the end of the cycle.',
    duration: 1,
    website: 'https://fastpool.org',
    payoutMethod: 'STX',
    poolAddress: {
      mainnet: NetworkInstanceToPoxContractMap['mainnet']['WrapperFastPool'],
      testnet: NetworkInstanceToPoxContractMap['testnet']['WrapperFastPool'],
      devnet: NetworkInstanceToPoxContractMap['devnet']['WrapperFastPool'],
    }, // pool address is the same as pool contract
    poxContract: 'WrapperFastPool',
    minimumDelegationAmount: 40_000_000,
    icon: <ImgFillLoader src="/icons/fastpool.webp" width="32" fill="black" />,
    allowCustomRewardAddress: false,
    disabled: false,
  },

  PlanBetter: {
    name: 'PlanBetter',
    description: 'Earn non-custodial Bitcoin yield. No wrapped tokens. Native BTC.',
    duration: 1,
    website: 'https://planbetter.org',
    payoutMethod: 'BTC',
    poolAddress: {
      mainnet: 'SP3TDKYYRTYFE32N19484838WEJ25GX40Z24GECPZ',
      testnet: 'SP3TDKYYRTYFE32N19484838WEJ25GX40Z24GECPZ',
      devnet: 'SP3TDKYYRTYFE32N19484838WEJ25GX40Z24GECPZ',
    },
    poxContract: 'WrapperOneCycle',
    minimumDelegationAmount: 200_000_000,
    icon: <ImgFillLoader src="/icons/planbetter.webp" width="32" fill="black" />,
    allowCustomRewardAddress: false, // only for ledger users
    disabled: false,
  },

  Restake: {
    name: 'Restake',
    description:
      'Earn STX rewards by pooling your tokens with Restake, a non-custodial infrastructure operator trusted by institutions.',
    duration: 1,
    website: 'https://restake.net/stacks-pool',
    payoutMethod: 'STX',
    poolAddress: {
      mainnet: NetworkInstanceToPoxContractMap['mainnet']['WrapperRestake'],
      testnet: NetworkInstanceToPoxContractMap['testnet']['WrapperRestake'],
      devnet: NetworkInstanceToPoxContractMap['devnet']['WrapperRestake'],
    }, // pool address is the same as pool contract
    poxContract: 'WrapperRestake',
    minimumDelegationAmount: 100_000_000,
    icon: <ImgFillLoader src="/icons/restake.webp" width="32" fill="#124044" />,
    allowCustomRewardAddress: false,
    disabled: false,
  },

  'Stacking DAO': {
    name: 'Stacking DAO',
    description:
      'Earn BTC rewards by pooling your tokens with Stacking DAO, the leading LST provider on Stacks.',
    duration: 1,
    website: 'https://app.stackingdao.com/?stackingOption=stx',
    payoutMethod: 'BTC',
    poolAddress: {
      mainnet: NetworkInstanceToPoxContractMap['mainnet']['WrapperStackingDao'],
      testnet: NetworkInstanceToPoxContractMap['testnet']['WrapperStackingDao'],
      devnet: NetworkInstanceToPoxContractMap['devnet']['WrapperStackingDao'],
    }, // pool address is the same as pool contract
    poxContract: 'WrapperStackingDao',
    minimumDelegationAmount: 500_000_000,
    icon: <ImgFillLoader src="/icons/stacking-dao.webp" width="32" fill="#1C3830" />,
    allowCustomRewardAddress: false,
    disabled: false,
  },

  Xverse: {
    name: 'Xverse',
    description:
      'Xverse pool is a non-custodial stacking pool service from the makers of Xverse wallet.',
    duration: 1,
    website: 'https://pool.xverse.app/',
    payoutMethod: 'BTC',
    poolAddress: {
      mainnet: 'SPXVRSEH2BKSXAEJ00F1BY562P45D5ERPSKR4Q33',
      testnet: 'SPXVRSEH2BKSXAEJ00F1BY562P45D5ERPSKR4Q33',
      devnet: 'SPXVRSEH2BKSXAEJ00F1BY562P45D5ERPSKR4Q33',
    },
    poxContract: 'WrapperOneCycle',
    minimumDelegationAmount: 100_000_000,
    icon: <ImgFillLoader src="/icons/xverse.webp" width="32" fill="black" />,
    allowCustomRewardAddress: true,
    disabled: false,
  },

  'Custom Pool': {
    name: 'Custom Pool',
    description:
      'Enter the STX address of the pool with which you’d like to Stack without your STX leaving your wallet.',
    duration: -1,
    website: 'https://www.stacks.co/learn/stacking',
    payoutMethod: 'OTHER',
    poolAddress: undefined,
    poxContract: 'Pox4',
    minimumDelegationAmount: MIN_DELEGATED_STACKING_AMOUNT_USTX,
    icon: <DummyIcon />,
    allowCustomRewardAddress: false,
    disabled: false,
  },
};

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

// Fakes values, to be updated
export const poolRewardProtocol: PoolRewardProtocolInfo = {
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
