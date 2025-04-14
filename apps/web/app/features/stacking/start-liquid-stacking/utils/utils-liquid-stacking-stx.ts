import { StacksNetworkName } from '@stacks/network';
import {
  StxPostCondition,
  contractPrincipalCV,
  noneCV,
  postConditionToWire,
  serializeCV,
  serializePostConditionWire,
  uintCV,
} from '@stacks/transactions';
import { protocols } from '~/features/stacking/start-liquid-stacking/utils/preset-protocols';
import {
  getLiquidContract,
  getLiquidContractAddressAndName,
} from '~/features/stacking/start-liquid-stacking/utils/utils-preset-protocols';
import { getNetworkInstanceByName } from '~/features/stacking/start-pooled-stacking/utils/utils-preset-pools';
import { StxCallContractParams } from '~/helpers/leather-sdk';

import { LeatherSdk } from '@leather.io/sdk';
import { stxToMicroStx } from '@leather.io/utils';

import { LiquidStackingFormValues } from './types';

function getOptions(
  values: LiquidStackingFormValues,
  network: StacksNetworkName
): StxCallContractParams {
  const protocol = values.protocolName ? protocols[values.protocolName] : undefined;
  if (!protocol) throw new Error('Invalid Protocol Name');
  const networkMode = getNetworkInstanceByName(network);

  const contract = getLiquidContract(networkMode, protocol.liquidContract);
  const [contractAddress] = getLiquidContractAddressAndName(networkMode, protocol.liquidContract);
  const stxAmount = stxToMicroStx(values.amount).toString();
  const stxAddress = values.stxAddress;
  const { functionArgs, functionName } =
    protocol.liquidContract === 'WrapperStackingDAO'
      ? {
          functionArgs: [
            contractPrincipalCV(contractAddress, 'reserve-v1'), // TODO: fails (SP4SZE494VC2YC5JYG7AYFQ44FQ4PYV7DVMDPBG) - Invalid c32check string: checksum mismatch
            uintCV(stxAmount),
            noneCV(),
          ],
          functionName: 'deposit',
        }
      : protocol.liquidContract === 'Lisa'
        ? { functionArgs: [uintCV(stxAmount)], functionName: 'request-mint' }
        : { functionArgs: [], functionName: 'deposit' };

  const postConditions: StxPostCondition[] = [
    {
      type: 'stx-postcondition',
      address: stxAddress,
      condition: 'lte',
      amount: stxAmount,
    },
  ];

  return {
    contract,
    functionName,
    functionArgs: functionArgs.map(arg => serializeCV(arg)),
    network,
    postConditions: postConditions.map(postConditionToWire).map(serializePostConditionWire),
  } satisfies StxCallContractParams;
}

interface CreateHandleSubmitArgs {
  leather: LeatherSdk;
  network: StacksNetworkName;
}

export function createDepositStxMutationOptions({ leather, network }: CreateHandleSubmitArgs) {
  return {
    mutationKey: ['deposit-stx', leather, network],
    mutationFn: async (values: LiquidStackingFormValues) => {
      const liquidStackStxOptions = getOptions(values, network);
      return leather.stxCallContract(liquidStackStxOptions);
    },
  } as const;
}
