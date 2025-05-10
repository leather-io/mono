import { z } from 'zod';
import { MIN_DELEGATED_STACKING_AMOUNT_USTX } from '~/constants/constants';

// Providers are partner entities that offer yeild based services
const providers = {
  xverse: {
    providerId: 'xverse',
    name: 'Xverse',
    url: 'https://xverse.app',
  },
  fastPool: {
    providerId: 'fastPool',
    name: 'Fast Pool',
    url: 'https://fastpool.org',
  },
  planbetter: {
    providerId: 'planbetter',
    name: 'PlanBetter',
    url: 'https://planbetter.org',
  },
  restake: {
    providerId: 'restake',
    name: 'Restake',
    url: 'https://restake.net/stacks-pool',
  },
  stackingDao: {
    providerId: 'stackingDao',
    name: 'Stacking DAO',
    url: 'https://www.stackingdao.com',
  },
  lisa: {
    providerId: 'lisa',
    name: 'LISA',
    url: 'https://www.lisalab.io',
  },
} as const;

export type ProviderId = keyof typeof providers;
export const providerIdSchema = z.enum(Object.keys(providers) as [ProviderId, ...ProviderId[]]);

export const yieldStrategies = {
  liquid: {
    name: 'Liquid Stacking',
    description:
      'Liquid Stacking allows you to earn STX rewards while keeping your STX liquid. You can use your stSTX or LiSTX to trade, lend, or borrow.',
  },
  pooled: {
    name: 'Pooled Stacking',
    description:
      'Pooled Stacking allows you to earn STX rewards by pooling your tokens with a trusted infrastructure operator. Your STX will be locked for a period of time.',
  },
} as const;

export type YieldStrategy = keyof typeof yieldStrategies;

export interface StackingPool {
  providerId: ProviderId;
  name: string;
  url: string;
  minAmount: string | null;
  estApr: string;
  payout: string;
  disabled: boolean;
  description: string;
  duration: number;
  poolAddress?: {
    mainnet: string;
    testnet: string;
    devnet: string;
  };
  fee: string;
  poxContract: string;
  minimumDelegationAmount: number;
  allowCustomRewardAddress: boolean;
  icon?: React.ReactNode;
}
export const stackingPoolData = {
  fastPool: {
    ...providers.fastPool,
    minAmount: '40 STX',
    estApr: '5%',
    payout: 'STX',
    disabled: false,
    description:
      'Enjoy automatic pool operations.' +
      ' ' +
      'You can increase the locking amount for the next cycle.' +
      ' ' +
      'Locked STX will unlock 1 day after the end of the cycle.',
    poolAddress: {
      mainnet: 'SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP.pox4-fast-pool-v3',
      testnet: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.pox4-self-service',
      devnet: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.pox4-self-service',
    },
    poxContract: 'WrapperFastPool',
    minimumDelegationAmount: 40_000_000,
    allowCustomRewardAddress: false,
    duration: 1,
    // icon: <ImgFillLoader src="/icons/fastpool.webp" width="32" fill="black" />,
  },
  fastPoolV2: {
    ...providers.fastPool,
    name: 'FAST Pool v2',
    minAmount: '40 STX',
    estApr: '5%',
    description:
      'Enjoy a better swim experience in the upgraded pool.' +
      ' ' +
      'You can increase the locking amount for the next cycle.' +
      ' ' +
      'Locked STX will unlock 1 day after the end of the cycle.',
    duration: 1,
    payout: 'STX',
    poolAddress: {
      mainnet: 'SPMPMA1V6P430M8C91QS1G9XJ95S59JS1TZFZ4Q4.pox4-multi-pool-v1',
      testnet: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.pox4-self-service',
      devnet: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.pox4-self-service',
    },
    poxContract: 'WrapperFastPoolV2',
    minimumDelegationAmount: 40_000_000,
    allowCustomRewardAddress: false,
    disabled: false,
  },
  planbetter: {
    ...providers.planbetter,
    fee: '5%',
    minAmount: '200 STX',
    estApr: '10%',
    payout: 'STX',
    description: 'Earn non-custodial Bitcoin yield. No wrapped tokens. Native BTC.',
    duration: 1,
    poolAddress: {
      mainnet: 'SP3TDKYYRTYFE32N19484838WEJ25GX40Z24GECPZ',
      testnet: 'SP3TDKYYRTYFE32N19484838WEJ25GX40Z24GECPZ',
      devnet: 'SP3TDKYYRTYFE32N19484838WEJ25GX40Z24GECPZ',
    },
    poxContract: 'WrapperOneCycle',
    minimumDelegationAmount: 200_000_000,
    allowCustomRewardAddress: false, // only for ledger users
    disabled: false,
  },
  restake: {
    ...providers.restake,
    fee: '5%',
    minAmount: '100 STX',
    estApr: '11%',
    payout: 'STX',
    description:
      'Earn STX rewards by pooling your tokens with Restake, a non-custodial infrastructure operator trusted by institutions.',
    duration: 1,
    poolAddress: {
      mainnet: 'SPZV5RJN5XTJHA76E0VHEFB0WPEH7E11NZZ4CGBK.restake-self-service-pool-v1',
      testnet: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.pox4-self-service',
      devnet: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.pox4-self-service',
    },
    poxContract: 'WrapperRestake',
    minimumDelegationAmount: 100_000_000,
    allowCustomRewardAddress: false,
    disabled: false,
  },
  xverse: {
    ...providers.xverse,
    fee: '5%',
    minAmount: '100 STX',
    estApr: '10%',
    payout: 'BTC',
    description:
      'Xverse pool is a non-custodial stacking pool service from the makers of Xverse wallet.',
    duration: 1,
    url: 'https://pool.xverse.app/',
    poolAddress: {
      mainnet: 'SPXVRSEH2BKSXAEJ00F1BY562P45D5ERPSKR4Q33',
      testnet: 'SPXVRSEH2BKSXAEJ00F1BY562P45D5ERPSKR4Q33',
      devnet: 'SPXVRSEH2BKSXAEJ00F1BY562P45D5ERPSKR4Q33',
    },
    poxContract: 'WrapperOneCycle',
    minimumDelegationAmount: 100_000_000,
    allowCustomRewardAddress: true,
    disabled: false,
  },
  stackingDao: {
    ...providers.stackingDao,
    fee: '5%',
    minAmount: '100 STX',
    estApr: '16%',
    payout: 'STX',
    description:
      'Enter the STX address of the pool with which you’d like to Stack without your STX leaving your wallet.',
    duration: -1,
    poolAddress: {
      mainnet: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-stacking-pool-v1',
      testnet: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-stacking-pool-v1',
      devnet: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-stacking-pool-v1',
    },
    poxContract: 'WrapperStackingDao',
    minimumDelegationAmount: MIN_DELEGATED_STACKING_AMOUNT_USTX,
    allowCustomRewardAddress: false,
    disabled: false,
  },
} as const satisfies Record<string, StackingPool>;

export const stackingPoolList = Object.values(stackingPoolData);

export type StackingProviderId = keyof typeof stackingPoolData;

export const stackingProviderIdSchema = z.enum(
  Object.keys(stackingPoolData) as [StackingProviderId, ...StackingProviderId[]]
);

export interface LiquidStackingPool {
  providerId: ProviderId;
  name: string;
  url: string;
  estApr: string;
  payout: string;
  slug: string;
  fee: string;
}
export const liquidStackingPoolData = {
  stackingDao: {
    ...providers.stackingDao,
    slug: 'stacking-dao',
    estApr: '5%',
    fee: '5%',
    payout: 'stSTX',
  },
  lisa: {
    ...providers.lisa,
    slug: 'lisa',
    estApr: '10%',
    fee: '5%',
    payout: 'LiSTX',
  },
} as const satisfies Record<string, LiquidStackingPool>;

export const liquidStackingProvidersList = Object.values(liquidStackingPoolData);

export const stackingContractMap = {
  mainnet: {
    Pox4: 'SP000000000000000000002Q6VF78.pox-4',
    WrapperOneCycle: 'SP001SFSMC2ZY76PD4M68P3WGX154XCH7NE3TYMX.pox4-pools',
    WrapperFastPool: 'SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP.pox4-fast-pool-v3',
    WrapperFastPoolV2: 'SPMPMA1V6P430M8C91QS1G9XJ95S59JS1TZFZ4Q4.pox4-multi-pool-v1',
    WrapperRestake: 'SPZV5RJN5XTJHA76E0VHEFB0WPEH7E11NZZ4CGBK.restake-self-service-pool-v1',
    WrapperStackingDao: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-stacking-pool-v1',
  },
  testnet: {
    Pox4: 'ST000000000000000000002AMW42H.pox-4',
    WrapperOneCycle: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.pox4-pools',
    WrapperFastPool: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.pox4-self-service',
    WrapperFastPoolV2: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.pox4-self-service',
    WrapperRestake: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.pox4-self-service',
    WrapperStackingDao: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-stacking-pool-v1',
  },
  devnet: {
    Pox4: 'ST000000000000000000002AMW42H.pox-4',
    WrapperOneCycle: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.pox4-pools',
    WrapperFastPool: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.pox4-self-service',
    WrapperFastPoolV2: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.pox4-self-service',
    WrapperRestake: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.pox4-self-service',
    WrapperStackingDao: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-stacking-pool-v1',
  },
} as const;

export type PoxContractName = keyof (typeof stackingContractMap)['mainnet'];
