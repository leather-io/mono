import { Dispatch, SetStateAction } from 'react';
import { NavigateFunction } from 'react-router';

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
import { z } from 'zod';
import { UI_IMPOSED_MAX_STACKING_AMOUNT_USTX } from '~/constants/constants';
import { StxCallContractParams, leather } from '~/helpers/leather-sdk';
import { cyclesToBurnChainHeight } from '~/utils/calculate-burn-height';
import { toHumanReadableStx } from '~/utils/unit-convert';
import { stxAmountSchema } from '~/utils/validators/stx-amount-validator';

import { stxToMicroStx } from '@leather.io/utils';

import { pools } from '../components/preset-pools';
import { EditingFormValues } from './types';
import { PoolName } from './types-preset-pools';
import { getNetworkInstanceByName, getPoxContract } from './utils-preset-pools';

interface Args {
  /**
   * The address of the currently active account. Used to ensure users don't delegate to themselves,
   * which although technically possible, is most likely not what they want.
   */
  currentAccountAddress: string;

  networkName: StacksNetworkName;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createValidationSchema(_args: Args) {
  return z
    .object({
      poolName: z.string().optional(),
      poolAddress: z.string(),
      amount: stxAmountSchema().refine(value => {
        if (value === undefined) return false;
        const enteredAmount = stxToMicroStx(value);
        return enteredAmount.isLessThanOrEqualTo(UI_IMPOSED_MAX_STACKING_AMOUNT_USTX);
      }),
      delegationDurationType: z.string({
        required_error: 'Please select the delegation duration type.',
      }),
    })
    .superRefine((data, ctx) => {
      const amount = data.amount;
      const poolName = data.poolName;
      if (!poolName) return;
      const minDelegatedStackingAmount = pools[poolName as PoolName]?.minimumDelegationAmount || 0;
      const enteredAmount = stxToMicroStx(amount || 0);
      if (enteredAmount.isLessThan(minDelegatedStackingAmount)) {
        ctx.addIssue({
          code: 'custom',
          message: `You must delegate at least ${toHumanReadableStx(minDelegatedStackingAmount)}`,
          path: ['amount'],
        });
      }
    });
}

function getOptions(
  values: EditingFormValues,
  poxInfo: PoxInfo,
  stackingContract: string,
  client: StackingClient,
  network: StacksNetworkName
): Parameters<typeof leather.stxCallContract>[0] {
  const untilBurnBlockHeight =
    values.delegationDurationType === 'limited'
      ? cyclesToBurnChainHeight({
          cycles: values.numberOfCycles,
          rewardCycleLength: poxInfo.reward_cycle_length,
          currentCycleId: poxInfo.current_cycle.id,
          firstBurnchainBlockHeight: poxInfo.first_burnchain_block_height,
        })
      : undefined;
  const pool = values.poolName ? pools[values.poolName] : undefined;
  if (!pool) throw new Error('Invalid Pool Name');
  const networkMode = getNetworkInstanceByName(network);
  const delegateTo = pool.poolAddress?.[networkMode] || values.poolAddress;

  if (values.poolName === 'Custom Pool') {
    const options = client.getDelegateOptions(
      {
        contract: stackingContract,
        amountMicroStx: stxToMicroStx(values.amount).toString(),
        delegateTo,
        untilBurnBlockHeight,
      }
      // Type coercion necessary because the `network` property returned by
      // `client.getStackingContract()` has a wider type than allowed by `showContractCall`. Despite
      // the wider type, the actual value of `network` is always of the type `StacksNetwork`
      // expected by `showContractCall`.
      //
      // See
      // https://github.com/hirosystems/stacks.js/blob/0e1f9f19dfa45788236c9e481f9a476d9948d86d/packages/stacking/src/index.ts#L1054
    );

    return {
      contract: stackingContract,
      functionName: options.functionName,
      functionArgs: options.functionArgs.map(arg => serializeCV(arg)),
      network,
    } satisfies StxCallContractParams;
  }

  const contract = getPoxContract(networkMode, pool.poxContract);

  let functionArgs: ClarityValue[];
  switch (pool.poxContract) {
    case 'WrapperOneCycle':
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
  client: StackingClient;
  network: StacksNetworkName;
  setIsContractCallExtensionPageOpen: Dispatch<SetStateAction<boolean>>;
  navigate: NavigateFunction;
}
export function createHandleSubmit({
  client,
  network,
  setIsContractCallExtensionPageOpen,
  navigate,
}: CreateHandleSubmitArgs) {
  return async function handleSubmit(values: EditingFormValues, onFinish?: () => void) {
    // TODO: handle thrown errors
    const [poxInfo, stackingContract] = await Promise.all([
      client.getPoxInfo(),
      client.getStackingContract(),
    ]);

    const delegateStxOptions = getOptions(values, poxInfo, stackingContract, client, network);

    setIsContractCallExtensionPageOpen(true);

    try {
      await leather.stxCallContract({
        ...delegateStxOptions,
      });
      onFinish?.();
      await navigate('../pooled-stacking-info');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setIsContractCallExtensionPageOpen(false);
    }
  };
}
