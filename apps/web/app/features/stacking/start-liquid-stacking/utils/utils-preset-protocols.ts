import { StacksNetwork } from '@stacks/network';
import { NetworkInstance } from '~/features/stacking/start-pooled-stacking/utils/types-preset-pools';
import { getNetworkInstance } from '~/features/stacking/start-pooled-stacking/utils/utils-preset-pools';

import {
  LiquidContractName,
  LiquidContractPrincipal,
  LiquidContractType,
  NetworkInstanceToLiquidContractMap,
} from './types-preset-protocols';

export function getPoxContracts(network: StacksNetwork): LiquidContractType {
  const mode = getNetworkInstance(network);
  return NetworkInstanceToLiquidContractMap[mode];
}

export function getLiquidContract(
  networkInstance: NetworkInstance,
  poxContractName: LiquidContractName
): LiquidContractPrincipal {
  return NetworkInstanceToLiquidContractMap[networkInstance][poxContractName];
}

export function getLiquidContractAddressAndName(
  networkInstance: NetworkInstance,
  poxContractName: LiquidContractName
) {
  return getLiquidContract(networkInstance, poxContractName).split('.');
}
