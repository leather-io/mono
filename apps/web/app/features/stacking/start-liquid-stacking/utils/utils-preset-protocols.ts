import { ProviderId } from '~/data/data';
import { NetworkMode } from '~/features/stacking/utils/stacking-network-types';

import {
  LiquidContractName,
  LiquidContractPrincipal,
  NetworkInstanceToLiquidContractMap,
  ProtocolSlug,
  ProtocolSlugToIdMap,
} from './types-preset-protocols';

export function getLiquidContract(
  networkInstance: NetworkMode,
  poxContractName: LiquidContractName
): LiquidContractPrincipal {
  return NetworkInstanceToLiquidContractMap[networkInstance][poxContractName];
}

export function getProtocolSlugByProviderId(providerId: ProviderId): ProtocolSlug | null {
  return (
    (Object.entries(ProtocolSlugToIdMap).find(
      ([, id]) => providerId === id
    )?.[0] as ProtocolSlug) || null
  );
}
