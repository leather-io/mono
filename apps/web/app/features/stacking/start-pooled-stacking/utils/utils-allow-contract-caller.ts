import { StacksNetwork, StacksNetworkName } from '@stacks/network';
import { StackingClient } from '@stacks/stacking';
import { noneCV, principalCV, serializeCV } from '@stacks/transactions';
import { PoolWrapperAllowanceState } from '~/features/stacking/start-pooled-stacking/utils/types';
import {
  getNetworkInstance,
  getPoxWrapperContract,
} from '~/features/stacking/start-pooled-stacking/utils/utils-preset-pools';
import { StxCallContractParams } from '~/helpers/leather-sdk';

import { LeatherSdk } from '@leather.io/sdk';

import { PoolName, WrapperPrincipal } from './types-preset-pools';

function getOptions(
  poxWrapperContract: WrapperPrincipal,
  stackingContract: string,
  network: StacksNetworkName
): StxCallContractParams {
  const functionArgs = [principalCV(poxWrapperContract), noneCV()];
  return {
    contract: stackingContract,
    functionName: 'allow-contract-caller',
    functionArgs: functionArgs.map(arg => serializeCV(arg)),
    network,
  };
}

export function isAllowContractCallerConfirmed(
  poolName: PoolName,
  network: StacksNetwork,
  hasUserConfirmedPoolWrapperContract: PoolWrapperAllowanceState
): boolean {
  const poxWrapperContract = getPoxWrapperContract(poolName, network);
  const networkInstance = getNetworkInstance(network);

  return Boolean(hasUserConfirmedPoolWrapperContract[networkInstance]?.[poxWrapperContract]);
}

interface CreateHandleSubmitArgs {
  leather: LeatherSdk;
  client: StackingClient;
  network: StacksNetworkName;
  poxWrapperContract: WrapperPrincipal;
}

export function createAllowContractCallerSubmitMutationOptions({
  leather,
  client,
  network,
  poxWrapperContract,
}: CreateHandleSubmitArgs) {
  return {
    mutationKey: ['allow-contract-caller', leather, client, network, poxWrapperContract],
    mutationFn: async () => {
      const [stackingContract] = await Promise.all([client.getStackingContract()]);

      const allowContractCallerOptions = getOptions(poxWrapperContract, stackingContract, network);

      return leather.stxCallContract(allowContractCallerOptions);
    },
  } as const;
}
