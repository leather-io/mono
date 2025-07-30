import { StacksNetwork } from '@stacks/network';
import {
  PoxContractName,
  StackingPool,
  StackingProviderId,
  stackingContractMap,
  stackingPoolData,
  stackingPoolList,
  stackingProviderIdSchema,
} from '~/data/data';
import { getNetworkInstance } from '~/features/stacking/utils/stacking-network-utils';

import { NetworkMode, PoolSlug, getStackingPoolById, poolSlugToIdMap } from './stacking-pool-types';

// Re-export for backwards compatibility
export {
  getNetworkInstance,
  getNetworkInstanceByName,
} from '~/features/stacking/utils/stacking-network-utils';

export function getPoxContractsByNetwork(network: StacksNetwork) {
  const mode = getNetworkInstance(network);
  return stackingContractMap[mode as keyof typeof stackingContractMap];
}

export function isPoxWrapperContract(pool: StackingPool) {
  return pool.poxContract !== 'Pox4';
}

export function requiresAllowContractCaller(providerId: string) {
  if (providerId === 'custom') return false;
  const pool = getStackingPoolById(stackingProviderIdSchema.parse(providerId));
  return isPoxWrapperContract(pool);
}

export function getPoxWrapperContract(providerId: string, network: StacksNetwork): string {
  const poxContracts = getPoxContractsByNetwork(network);
  const poxContract = getStackingPoolById(stackingProviderIdSchema.parse(providerId))
    .poxContract satisfies PoxContractName;
  return poxContracts[poxContract];
}

export function getPoxWrapperContract2(
  networkInstance: NetworkMode,
  poxContractName: PoxContractName
): string {
  return stackingContractMap[networkInstance as keyof typeof stackingContractMap][poxContractName];
}

export function isSelfServicePool(poolAddress: string) {
  const allSelfServicePools: string[] = [
    stackingPoolData.fastPool.poolAddress.mainnet,
    stackingPoolData.fastPool.poolAddress.testnet,
    stackingPoolData.fastPool.poolAddress.devnet,
    stackingPoolData.restake.poolAddress.mainnet,
    stackingPoolData.restake.poolAddress.testnet,
    stackingPoolData.restake.poolAddress.devnet,
  ];
  return allSelfServicePools.includes(poolAddress);
}

export function getPoxContract(networkInstance: NetworkMode, poxContract: PoxContractName) {
  return stackingContractMap[networkInstance as keyof typeof stackingContractMap][poxContract];
}

export function getPoxContractAddressAndName(
  networkInstance: NetworkMode,
  poxContract: PoxContractName
) {
  return getPoxContract(networkInstance, poxContract).split('.');
}

export function getPoolByAddress(address: string) {
  return stackingPoolList.find(pool =>
    Object.values(pool.poolAddress ?? {}).includes(address as any)
  );
}

export function getPoolSlugByPoolName(poolId: StackingProviderId): PoolSlug | undefined {
  return Object.entries(poolSlugToIdMap).find(([, id]) => id === poolId)?.[0] as
    | PoolSlug
    | undefined;
}
