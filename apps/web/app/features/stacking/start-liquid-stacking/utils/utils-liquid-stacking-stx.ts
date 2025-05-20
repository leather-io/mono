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
import { getNetworkInstanceByName } from '~/features/stacking/start-pooled-stacking/utils/utils-stacking-pools';
import { StxCallContractParams } from '~/helpers/leather-sdk';

import { LeatherSdk } from '@leather.io/sdk';
import { stxToMicroStx } from '@leather.io/utils';

import { LiquidStackingFormValues } from './types';
import { LiquidContractName } from './types-preset-protocols';

interface GetFunctionDataArgs {
  contractName: LiquidContractName;
  stxAmount: string;
  contractAddress: string;
}

function getLiquidStackingFunctionData({
  contractName,
  stxAmount,
  contractAddress,
}: GetFunctionDataArgs) {
  if (contractName === 'WrapperStackingDAO') {
    return {
      functionArgs: [
        contractPrincipalCV(contractAddress, 'reserve-v1'),
        contractPrincipalCV(contractAddress, 'commission-v2'),
        contractPrincipalCV(contractAddress, 'staking-v0'),
        contractPrincipalCV(contractAddress, 'direct-helpers-v3'),
        uintCV(stxAmount),
        noneCV(),
        noneCV(),
      ],
      functionName: 'deposit',
    };
  }

  if (contractName === 'lisa') {
    return {
      functionArgs: [uintCV(stxAmount)],
      functionName: 'request-mint',
    };
  }

  return {
    functionArgs: [],
    functionName: 'deposit',
  };
}

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

  const { functionArgs, functionName } = getLiquidStackingFunctionData({
    contractName: protocol.liquidContract,
    stxAmount,
    contractAddress,
  });

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
