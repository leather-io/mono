import { z } from 'zod';

export type NetworkInstance = 'mainnet' | 'testnet' | 'devnet';

export const PoolSlugToIdMap = {
  'fast-pool': 'fastPool',
  'plan-better': 'planBetter',
  'stacking-dao': 'stackingDao',
  xverse: 'xverse',
  restake: 'restake',
  custom: 'custom',
} as const;

export const PoolIdToDisplayNameMap = {
  fastPool: 'FAST Pool',
  planBetter: 'PlanBetter',
  stackingDao: 'Stacking DAO',
  xverse: 'Xverse',
  restake: 'Restake',
  custom: 'Custom Pool',
} as const;

export type PoolSlug = keyof typeof PoolSlugToIdMap;

export const poolSlugSchema = z.enum(Object.keys(PoolSlugToIdMap) as [PoolSlug, ...PoolSlug[]]);

export type PoolId = (typeof PoolSlugToIdMap)[PoolSlug];
export type PoolName = (typeof PoolIdToDisplayNameMap)[PoolId];

export type PoxContractName =
  | 'WrapperOneCycle'
  | 'WrapperFastPool'
  | 'WrapperRestake'
  | 'WrapperStackingDao'
  | 'Pox4';

export const NetworkInstanceToPoxContractMap = {
  devnet: {
    Pox4: 'ST000000000000000000002AMW42H.pox-4',
    WrapperOneCycle: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.pox4-pools',
    WrapperFastPool: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.pox4-self-service',
    WrapperRestake: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.pox4-self-service',
    WrapperStackingDao: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-stacking-pool-v1',
  },
  testnet: {
    Pox4: 'ST000000000000000000002AMW42H.pox-4',
    WrapperOneCycle: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.pox4-pools',
    WrapperFastPool: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.pox4-self-service',
    WrapperRestake: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.pox4-self-service',
    WrapperStackingDao: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-stacking-pool-v1',
  },
  mainnet: {
    Pox4: 'SP000000000000000000002Q6VF78.pox-4',
    WrapperOneCycle: 'SP001SFSMC2ZY76PD4M68P3WGX154XCH7NE3TYMX.pox4-pools',
    WrapperFastPool: 'SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP.pox4-fast-pool-v3',
    WrapperRestake: 'SPZV5RJN5XTJHA76E0VHEFB0WPEH7E11NZZ4CGBK.restake-self-service-pool-v1',
    WrapperStackingDao: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-stacking-pool-v1',
  },
} as const;

export type PayoutMethod = 'BTC' | 'STX' | 'OTHER';

type ContractMapType = typeof NetworkInstanceToPoxContractMap;
export type PoxContractType = ContractMapType[NetworkInstance];
export type WrapperPrincipal = PoxContractType[keyof PoxContractType];

export interface Pool {
  name: PoolName;
  poolAddress: Record<NetworkInstance, string> | undefined;
  description: string;
  website: string;
  duration: number;
  icon: JSX.Element;
  payoutMethod: PayoutMethod;
  poxContract: PoxContractName;
  minimumDelegationAmount: number;
  allowCustomRewardAddress: boolean;
  disabled: boolean;
}
