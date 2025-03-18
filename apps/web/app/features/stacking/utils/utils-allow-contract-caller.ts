import { Dispatch, SetStateAction } from 'react';

import { StacksNetworkName } from '@stacks/network';
import { StackingClient } from '@stacks/stacking';
import { noneCV, principalCV, serializeCV } from '@stacks/transactions';
import { StxCallContractParams, leather } from '~/helpers/leather-sdk';

import { WrapperPrincipal } from './types-preset-pools';

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

export interface HandleAllowContractCallerArgs {
  poxWrapperContract: WrapperPrincipal;
  onFinish: () => void;
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
  return async function handleSubmit({
    poxWrapperContract,
    onFinish,
  }: HandleAllowContractCallerArgs) {
    // TODO: handle thrown errors
    const [stackingContract] = await Promise.all([client.getStackingContract()]);

    const allowContractCallerOptions = getOptions(poxWrapperContract, stackingContract, network);

    setIsContractCallExtensionPageOpen(true);

    try {
      await leather.stxCallContract({
        ...allowContractCallerOptions,
      });
      onFinish?.();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setIsContractCallExtensionPageOpen(false);
    }
  };
}
