import { StacksNetwork } from '@stacks/network';
import { protocols } from '~/features/stacking/start-liquid-stacking/utils/preset-protocols';
import { NetworkMode } from '~/features/stacking/start-pooled-stacking/utils/stacking-pool-types';
import { getNetworkInstance } from '~/features/stacking/start-pooled-stacking/utils/utils-stacking-pools';

import {
  LiquidContractName,
  LiquidContractPrincipal,
  LiquidContractType,
  NetworkInstanceToLiquidContractMap,
  ProtocolIdToDisplayNameMap,
  ProtocolName,
  ProtocolSlug,
  ProtocolSlugToIdMap,
  protocolSlugSchema,
} from './types-preset-protocols';

export function getPoxContracts(network: StacksNetwork): LiquidContractType {
  const mode = getNetworkInstance(network);
  return NetworkInstanceToLiquidContractMap[mode];
}

export function getLiquidContract(
  networkInstance: NetworkMode,
  poxContractName: LiquidContractName
): LiquidContractPrincipal {
  return NetworkInstanceToLiquidContractMap[networkInstance][poxContractName];
}

export function getLiquidContractAddressAndName(
  networkInstance: NetworkMode,
  poxContractName: LiquidContractName
) {
  return getLiquidContract(networkInstance, poxContractName).split('.');
}

export function getProtocolBySlug(protocolSlug: ProtocolSlug) {
  const protocolId = ProtocolSlugToIdMap[protocolSlug];
  const protocolName = ProtocolIdToDisplayNameMap[protocolId];
  return protocols[protocolName];
}

export function getProtocolSlugByProtocolName(
  protocolName: ProtocolName
): ProtocolSlug | undefined {
  const [poolId] =
    Object.entries(ProtocolIdToDisplayNameMap).find(([, name]) => name === protocolName) ?? [];
  const [poolSlug] = Object.entries(ProtocolSlugToIdMap).find(([, name]) => name === poolId) ?? [];
  const result = protocolSlugSchema.safeParse(poolSlug);
  return result.success ? result.data : undefined;
}
