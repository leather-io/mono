import { ChainId, StacksNetwork, StacksNetworkName } from '@stacks/network';
import { DEFAULT_DEVNET_SERVER } from '~/constants/constants';
import {
  PoxContractName,
  StackingProvider,
  poxContractMap,
  stackingProviderData,
  stackingProvidersList,
} from '~/data/data';

import {
  NetworkMode,
  PoolId,
  PoolSlug,
  getStackingPoolById,
  poolSlugToIdMap,
} from './types-preset-pools';

export function getNetworkInstance(network: StacksNetwork): NetworkMode {
  if (network.chainId === ChainId.Mainnet) {
    return 'mainnet';
  }

  if (network.client.baseUrl === DEFAULT_DEVNET_SERVER) {
    return 'devnet';
  }

  return 'testnet';
}

export function getNetworkInstanceByName(networkName: StacksNetworkName) {
  if (networkName === 'mainnet' || networkName === 'devnet') {
    return networkName;
  }

  return 'testnet';
}

export function getPoxContractsByNetwork(network: StacksNetwork) {
  const mode = getNetworkInstance(network);
  return poxContractMap[mode];
}

export function isPoxWrapperContract(pool: StackingProvider) {
  return pool.poxContract !== 'Pox4';
}

export function requiresAllowContractCaller(providerId: string) {
  if (providerId === 'Custom Pool') return false;
  const pool = getStackingPoolById(providerId as PoolId);
  return isPoxWrapperContract(pool);
}

export function getPoxWrapperContract(providerId: string, network: StacksNetwork): string {
  const poxContracts = getPoxContractsByNetwork(network);
  const poxContract = getStackingPoolById(providerId as PoolId)
    .poxContract satisfies PoxContractName;
  return poxContracts[poxContract];
}

export function getPoxWrapperContract2(
  networkInstance: NetworkMode,
  poxContractName: PoxContractName
): string {
  return poxContractMap[networkInstance][poxContractName];
}

export function isSelfServicePool(poolAddress: string) {
  const allSelfServicePools: string[] = [
    stackingProviderData.fastpool.poolAddress.mainnet,
    stackingProviderData.fastpool.poolAddress.testnet,
    stackingProviderData.fastpool.poolAddress.devnet,
    stackingProviderData.restake.poolAddress.mainnet,
    stackingProviderData.restake.poolAddress.testnet,
    stackingProviderData.restake.poolAddress.devnet,
  ];
  return allSelfServicePools.includes(poolAddress);
}

export function getPoxContract(networkInstance: NetworkMode, poxContract: PoxContractName) {
  return poxContractMap[networkInstance][poxContract];
}

export function getPoxContractAddressAndName(
  networkInstance: NetworkMode,
  poxContract: PoxContractName
) {
  return getPoxContract(networkInstance, poxContract).split('.');
}

export function getPoolByAddress(address: string) {
  return stackingProvidersList.find(pool =>
    Object.values(pool.poolAddress ?? {}).includes(address as any)
  );
}

export function getPoolSlugByPoolName(poolId: PoolId): PoolSlug | undefined {
  return Object.entries(poolSlugToIdMap).find(([, id]) => id === poolId)?.[0] as
    | PoolSlug
    | undefined;
}
