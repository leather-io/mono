import { StacksNetworkName } from '@stacks/network';
import { PoxInfo, StackingClient, poxAddressToTuple } from '@stacks/stacking';
import {
  ClarityValue,
  noneCV,
  principalCV,
  serializeCV,
  someCV,
  uintCV,
} from '@stacks/transactions';
import { StackingProviderId } from '~/data/data';
import { analytics } from '~/features/analytics/analytics';
import { StxCallContractParams } from '~/helpers/leather-sdk';
import { cyclesToBurnChainHeight } from '~/utils/calculate-burn-height';

import { LeatherSdk } from '@leather.io/sdk';
import { scaleValue, stxToMicroStx } from '@leather.io/utils';

import { getStackingPoolById } from './stacking-pool-types';
import { StackingFormValues } from './types';
import { getNetworkInstanceByName, getPoxContract } from './utils-stacking-pools';

function getDelegateStxOptions(
  values: StackingFormValues,
  poxInfo: PoxInfo,
  network: StacksNetworkName
): StxCallContractParams {
  const untilBurnBlockHeight =
    values.delegationDurationType === 'limited'
      ? cyclesToBurnChainHeight({
          cycles: values.numberOfCycles,
          rewardCycleLength: poxInfo.reward_cycle_length,
          currentCycleId: poxInfo.current_cycle.id,
          firstBurnchainBlockHeight: poxInfo.first_burnchain_block_height,
        })
      : undefined;
  const pool = getStackingPoolById(values.providerId as StackingProviderId);
  if (!pool) throw new Error('Invalid Pool Name');
  const networkMode = getNetworkInstanceByName(network);
  const delegateTo = pool.poolAddress?.[networkMode] || values.poolAddress;

  // if (values.name === 'Custom Pool') {
  //   const options = client.getDelegateOptions(
  //     {
  //       contract: stackingContract,
  //       amountMicroStx: stxToMicroStx(values.amount).toString(),
  //       delegateTo,
  //       untilBurnBlockHeight,
  //     }
  //     // Type coercion necessary because the `network` property returned by
  //     // `client.getStackingContract()` has a wider type than allowed by `showContractCall`. Despite
  //     // the wider type, the actual value of `network` is always of the type `StacksNetwork`
  //     // expected by `showContractCall`.
  //     //
  //     // See
  //     // https://github.com/hirosystems/stacks.js/blob/0e1f9f19dfa45788236c9e481f9a476d9948d86d/packages/stacking/src/index.ts#L1054
  //   );

  //   return {
  //     contract: stackingContract,
  //     functionName: options.functionName,
  //     functionArgs: options.functionArgs.map(arg => serializeCV(arg)),
  //     network,
  //   } satisfies StxCallContractParams;
  // }

  const contract = getPoxContract(networkMode, pool.poxContract);

  let functionArgs: ClarityValue[];
  switch (pool.poxContract) {
    case 'WrapperOneCycle':
    case 'WrapperStackingDao':
      functionArgs = [
        uintCV(stxToMicroStx(values.amount).toString()),
        principalCV(delegateTo),
        untilBurnBlockHeight ? someCV(uintCV(untilBurnBlockHeight)) : noneCV(),
        noneCV(),
        poxAddressToTuple(values.rewardAddress),
        noneCV(),
      ];
      break;
    case 'WrapperFastPool':
    case 'WrapperRestake':
      functionArgs = [uintCV(stxToMicroStx(values.amount).toString())];
      break;
    default:
      functionArgs = [];
  }
  return {
    contract,
    functionName: 'delegate-stx',
    functionArgs: functionArgs.map(arg => serializeCV(arg)),
    network,
  } satisfies StxCallContractParams;
}

interface CreateHandleSubmitArgs {
  leather: LeatherSdk;
  client: StackingClient;
  network: StacksNetworkName;
}

export function createDelegateStxMutationOptions({
  leather,
  client,
  network,
}: CreateHandleSubmitArgs) {
  return {
    mutationKey: ['delegate-stx', leather, client, network],
    mutationFn: async (values: StackingFormValues) => {
      const [poxInfo] = await Promise.all([client.getPoxInfo(), client.getStackingContract()]);

      const delegateStxOptions = getDelegateStxOptions(values, poxInfo, network);

      await analytics.track('pooled_stacking_started', {
        provider: values.providerId,
        amount: scaleValue(values.amount),
        poolAddress: values.poolAddress,
        delegationDurationType: values.delegationDurationType,
        numberOfCycles: values.numberOfCycles,
      });

      return leather.stxCallContract(delegateStxOptions);
    },
  } as const;
}
