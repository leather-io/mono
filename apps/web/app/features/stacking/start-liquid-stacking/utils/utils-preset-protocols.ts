import { ProviderId } from '~/data/data';
import { protocols } from '~/features/stacking/start-liquid-stacking/utils/preset-protocols';
import { NetworkMode } from '~/features/stacking/utils/stacking-network-types';

import {
  LiquidContractName,
  LiquidContractPrincipal,
  NetworkInstanceToLiquidContractMap,
  ProtocolIdToDisplayNameMap,
  ProtocolSlug,
  ProtocolSlugToIdMap,
} from './types-preset-protocols';

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

export function getProtocolSlugByProviderId(providerId: ProviderId): ProtocolSlug | null {
  return (
    (Object.entries(ProtocolSlugToIdMap).find(
      ([, id]) => providerId === id
    )?.[0] as ProtocolSlug) || null
  );
}

export function getProtocolBySlug(protocolSlug: ProtocolSlug) {
  const protocolId = ProtocolSlugToIdMap[protocolSlug];
  const protocolName = ProtocolIdToDisplayNameMap[protocolId];
  return protocols[protocolName];
}

export function getProtocolIdBySlug(protocolSlug: ProtocolSlug) {
  return ProtocolSlugToIdMap[protocolSlug];
}
