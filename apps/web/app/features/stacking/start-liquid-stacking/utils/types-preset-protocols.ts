import { NetworkMode } from '~/features/stacking/utils/stacking-network-types';

export const ProtocolSlugToIdMap = {
  'stacking-dao': 'stackingDao',
  lisa: 'lisa',
} as const;

export type ProtocolSlug = keyof typeof ProtocolSlugToIdMap;

export type LiquidContractName = 'WrapperStackingDAO' | 'lisa';

export const NetworkInstanceToLiquidContractMap = {
  devnet: {
    WrapperStackingDAO: '',
    lisa: '',
  },
  testnet: {
    WrapperStackingDAO: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.stacking-dao-core-v1',
    lisa: '',
  },
  mainnet: {
    WrapperStackingDAO: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v6',
    lisa: 'SM3KNVZS30WM7F89SXKVVFY4SN9RMPZZ9FX929N0V.lqstx-mint-endpoint-v2-01',
  },
} as const;

type ContractMapType = typeof NetworkInstanceToLiquidContractMap;
type LiquidContractType = ContractMapType[NetworkMode];
export type LiquidContractPrincipal = LiquidContractType[keyof LiquidContractType];
