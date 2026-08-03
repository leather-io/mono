import { z } from 'zod';

// Providers are partner entities that offer yeild based services
const providers = {
  xversePool: {
    providerId: 'xversePool',
    name: 'Xverse',
    url: 'https://xverse.app',
  },
  fastPool: {
    providerId: 'fastPool',
    name: 'Fast Pool',
    url: 'https://fastpool.org',
  },
  fastPoolV2: {
    providerId: 'fastPoolV2',
    name: 'Fast Pool V2',
    url: 'https://fastpool.org',
  },
  planbetter: {
    providerId: 'planbetter',
    name: 'PlanBetter',
    url: 'https://planbetter.com',
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
  senseiNode: {
    providerId: 'senseiNode',
    name: 'SenseiNode',
    url: 'https://senseinode.com',
  },
  lisa: {
    providerId: 'lisa',
    name: 'LISA',
    url: 'https://www.lisalab.io',
  },
} as const;

export type ProviderId = keyof typeof providers;
export const providerIdSchema = z.enum(Object.keys(providers) as [ProviderId, ...ProviderId[]]);

export interface LiquidStackingPool {
  providerId: ProviderId;
  name: string;
  url: string;
  estApr: string;
  payout: string;
  slug: string;
  fee: string;
}
const liquidStackingPoolData = {
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
    fee: '0.00%',
    payout: 'LiSTX',
  },
} as const satisfies Record<string, LiquidStackingPool>;

export const liquidStackingProvidersList = Object.values(liquidStackingPoolData);

export const stackingContractMap = {
  mainnet: {
    Pox4: 'SP000000000000000000002Q6VF78.pox-4',
    Pox5: 'SP000000000000000000002Q6VF78.pox-5',
    WrapperOneCycle: 'SP001SFSMC2ZY76PD4M68P3WGX154XCH7NE3TYMX.pox4-pools',
    WrapperFastPool: 'SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP.pox4-fast-pool-v3',
    WrapperFastPoolV2: 'SPMPMA1V6P430M8C91QS1G9XJ95S59JS1TZFZ4Q4.pox4-multi-pool-v1',
    WrapperRestake: 'SPZV5RJN5XTJHA76E0VHEFB0WPEH7E11NZZ4CGBK.restake-self-service-pool-v1',
    WrapperStackingDao: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-stacking-pool-v1',
  },
  testnet: {
    Pox4: 'ST000000000000000000002AMW42H.pox-4',
    Pox5: 'ST000000000000000000002AMW42H.pox-5',
    WrapperOneCycle: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.pox4-pools',
    WrapperFastPool: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.pox4-self-service',
    WrapperFastPoolV2: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.pox4-self-service',
    WrapperRestake: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.pox4-self-service',
    WrapperStackingDao: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-stacking-pool-v1',
  },
  devnet: {
    Pox4: 'ST000000000000000000002AMW42H.pox-4',
    Pox5: 'ST000000000000000000002AMW42H.pox-5',
    WrapperOneCycle: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.pox4-pools',
    WrapperFastPool: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.pox4-self-service',
    WrapperFastPoolV2: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.pox4-self-service',
    WrapperRestake: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.pox4-self-service',
    WrapperStackingDao: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-stacking-pool-v1',
  },
} as const;
