import { ChainId, StacksNetwork, StacksNetworkName } from '@stacks/network';
import { DEFAULT_DEVNET_SERVER } from '~/constants';

import { pools } from '../components/preset-pools';
import {
  NetworkInstance,
  NetworkInstanceToPoxContractMap,
  Pool,
  PoolName,
  PoxContractName,
  PoxContractType,
  WrapperPrincipal,
} from './types-preset-pools';

export function getNetworkInstance(network: StacksNetwork) {
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

export function getPoxContracts(network: StacksNetwork): PoxContractType {
  const mode = getNetworkInstance(network);
  return NetworkInstanceToPoxContractMap[mode];
}

export function usesPoxWrapperContract(pool: Pool) {
  return pool.poxContract !== 'Pox4';
}

export function requiresAllowContractCaller(poolName: PoolName) {
  if (poolName === 'Custom Pool') return false;
  const pool = pools[poolName];
  return usesPoxWrapperContract(pool);
}

export function getPoxWrapperContract(
  poolName: PoolName,
  network: StacksNetwork
): WrapperPrincipal {
  const poxContracts = getPoxContracts(network);
  const poxContract = pools[poolName].poxContract satisfies PoxContractName;

  return poxContracts[poxContract];
}

export function getPoxWrapperContract2(
  networkInstance: NetworkInstance,
  poxContractName: PoxContractName
): WrapperPrincipal {
  return NetworkInstanceToPoxContractMap[networkInstance][poxContractName];
}

export function isSelfServicePool(poolAddress: string) {
  const allSelfServicePools: string[] = [
    NetworkInstanceToPoxContractMap['mainnet']['WrapperFastPool'],
    NetworkInstanceToPoxContractMap['testnet']['WrapperFastPool'],
    NetworkInstanceToPoxContractMap['devnet']['WrapperFastPool'],
    NetworkInstanceToPoxContractMap['mainnet']['WrapperRestake'],
    NetworkInstanceToPoxContractMap['testnet']['WrapperRestake'],
    NetworkInstanceToPoxContractMap['devnet']['WrapperRestake'],
  ];
  return allSelfServicePools.includes(poolAddress);
}

export function getPoxContract(networkInstance: NetworkInstance, poxContract: PoxContractName) {
  return NetworkInstanceToPoxContractMap[networkInstance][poxContract];
}

export function getPoxContractAddressAndName(
  networkInstance: NetworkInstance,
  poxContract: PoxContractName
) {
  return getPoxContract(networkInstance, poxContract).split('.');
}
