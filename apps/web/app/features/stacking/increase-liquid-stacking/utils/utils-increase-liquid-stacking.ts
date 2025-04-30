import { StacksNetworkName } from '@stacks/network';
import { ExtendedAccountBalances, StackingClient } from '@stacks/stacking';
import { serializeCV } from '@stacks/transactions';
import BigNumber from 'bignumber.js';
import { stxToMicroStxBigint } from '~/utils/unit-convert';

import { LeatherSdk } from '@leather.io/sdk';
import { formatContractId } from '@leather.io/stacks';
import { stxToMicroStx } from '@leather.io/utils';

import { StackIncreaseInfo } from '../../direct-stacking-info/get-has-pending-stack-increase';
import { SignerDetailsFormValues } from './types';

export interface IncreaseLiquidFormSchema extends SignerDetailsFormValues {
  increaseBy: number;
}

interface CreateHandleSubmitArgs {
  leather: LeatherSdk;
  network: StacksNetworkName;
  client: StackingClient;
}

export function createIncreaseLiquidMutationOptions({
  leather,
  network,
  client,
}: CreateHandleSubmitArgs) {
  return {
    mutationKey: ['increase-liquid', leather, network],
    mutationFn: async ({
      increaseBy,
      signerKey,
      signerSignature,
      maxAmount: maxAmountStr,
      authId,
    }: IncreaseLiquidFormSchema) => {
      const maxAmount = stxToMicroStxBigint(maxAmountStr);
      const stackingContract = await client.getStackingContract();
      const stackIncreaseOptions = client.getStackIncreaseOptions({
        contract: stackingContract,
        increaseBy: stxToMicroStx(increaseBy).toString(),
        signerKey,
        signerSignature,
        maxAmount,
        authId: authId ? parseInt(authId, 10) : undefined,
      });

      return leather.stxCallContract({
        contract: formatContractId(
          stackIncreaseOptions.contractAddress,
          stackIncreaseOptions.contractName
        ),
        functionName: stackIncreaseOptions.functionName,
        functionArgs: stackIncreaseOptions.functionArgs.map(arg => serializeCV(arg)),
        network,
      });
    },
  } as const;
}

export function getAvailableAmountUstx(
  extendedStxBalances: ExtendedAccountBalances['stx'],
  stackIncreaseInfo: StackIncreaseInfo | undefined | null
) {
  return new BigNumber(extendedStxBalances.balance.toString())
    .minus(new BigNumber(extendedStxBalances.locked.toString()))
    .minus(new BigNumber(stackIncreaseInfo ? stackIncreaseInfo.increaseBy.toString() : 0));
}
