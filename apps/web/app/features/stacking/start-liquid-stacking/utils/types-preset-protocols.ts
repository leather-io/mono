import { ReactElement } from 'react';

import { z } from 'zod';

import { NetworkMode } from '../../start-pooled-stacking/utils/stacking-pool-types';

export const ProtocolSlugToIdMap = {
  'stacking-dao': 'stackingDao',
  lisa: 'lisa',
} as const;

export const ProtocolIdToDisplayNameMap = {
  stackingDao: 'Stacking DAO',
  lisa: 'Lisa',
} as const;

export type ProtocolSlug = keyof typeof ProtocolSlugToIdMap;

export const protocolSlugSchema = z.enum(
  Object.keys(ProtocolSlugToIdMap) as [ProtocolSlug, ...ProtocolSlug[]]
);

export type ProtocolId = (typeof ProtocolSlugToIdMap)[ProtocolSlug];
export type ProtocolName = (typeof ProtocolIdToDisplayNameMap)[ProtocolId];

export const LiquidContractNameMap = {
  WrapperStackingDAO: 'WrapperStackingDAO',
  Lisa: 'Lisa',
} as const;

export type LiquidContractName = keyof typeof LiquidContractNameMap;

export const NetworkInstanceToLiquidContractMap = {
  devnet: {
    WrapperStackingDAO: '',
    Lisa: '',
  },
  testnet: {
    WrapperStackingDAO: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.stacking-dao-core-v1',
    Lisa: '',
  },
  mainnet: {
    WrapperStackingDAO: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v4',
    Lisa: 'SM3KNVZS30WM7F89SXKVVFY4SN9RMPZZ9FX929N0V.lqstx-mint-endpoint-v2-01',
  },
} as const;

export const LiquidTokenMap = {
  ST_STX: 'stSTX',
  LI_STX: 'LiSTX',
  OTHER: 'OTHER',
} as const;

export type LiquidToken = keyof typeof LiquidTokenMap;

type ContractMapType = typeof NetworkInstanceToLiquidContractMap;
export type LiquidContractType = ContractMapType[NetworkMode];
export type LiquidContractPrincipal = LiquidContractType[keyof LiquidContractType];

export interface Protocol {
  name: ProtocolName;
  protocolAddress: Record<NetworkMode, string> | undefined;
  description: string;
  website: string;
  duration: number;
  icon: ReactElement;
  liquidContract: LiquidContractName;
  liquidToken: LiquidToken;
  minimumDelegationAmount: number;
}
