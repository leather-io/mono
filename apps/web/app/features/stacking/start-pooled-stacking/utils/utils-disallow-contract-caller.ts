import { Dispatch, SetStateAction } from 'react';

import { StacksNetworkName } from '@stacks/network';
import { StackingClient } from '@stacks/stacking';
import { principalCV } from '@stacks/transactions';
import { StxCallContractParams, leather } from '~/helpers/leather-sdk';

import { WrapperPrincipal } from './types-preset-pools';

function getOptions(
  poxWrapperContract: WrapperPrincipal,
  stackingContract: string,
  network: StacksNetworkName
): StxCallContractParams {
  const functionArgs = [principalCV(poxWrapperContract).value];
  return {
    contract: stackingContract,
    functionName: 'disallow-contract-caller',
    functionArgs,
    network,
  };
}

interface CreateHandleSubmitArgs {
  client: StackingClient;
  network: StacksNetworkName;
  setIsContractCallExtensionPageOpen: Dispatch<SetStateAction<boolean>>;
}
export function createHandleSubmit({
  client,
  network,
  setIsContractCallExtensionPageOpen,
}: CreateHandleSubmitArgs) {
  return async function handleSubmit(poxWrapperContract: WrapperPrincipal) {
    // TODO: handle thrown errors
    const [stackingContract] = await Promise.all([client.getStackingContract()]);

    const disAllowContracCallerOptions = getOptions(poxWrapperContract, stackingContract, network);

    setIsContractCallExtensionPageOpen(true);

    try {
      await leather.stxCallContract({
        ...disAllowContracCallerOptions,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setIsContractCallExtensionPageOpen(false);
    }
  };
}
