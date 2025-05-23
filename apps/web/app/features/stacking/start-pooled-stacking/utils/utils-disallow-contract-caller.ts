import { Dispatch, SetStateAction } from 'react';

import { StacksNetworkName } from '@stacks/network';
import { StackingClient } from '@stacks/stacking';
import { principalCV } from '@stacks/transactions';
import { analytics } from '~/features/analytics/analytics';
import { StxCallContractParams, leather } from '~/helpers/leather-sdk';

function getOptions(
  poxWrapperContract: string,
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
  return async function handleSubmit(poxWrapperContract: string) {
    // TODO: handle thrown errors
    const [stackingContract] = await Promise.all([client.getStackingContract()]);

    const disallowContractCallerOptions = getOptions(poxWrapperContract, stackingContract, network);

    setIsContractCallExtensionPageOpen(true);

    try {
      void analytics.untypedTrack('contract_caller_disallowed');
      await leather.stxCallContract({
        ...disallowContractCallerOptions,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setIsContractCallExtensionPageOpen(false);
    }
  };
}
