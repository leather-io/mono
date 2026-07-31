import {
  ClarityValue,
  contractPrincipalCV,
  postConditionToHex,
  serializeCV,
} from '@stacks/transactions';
import { StxCallContractParams } from '~/utils/leather-sdk';

import { parseContractId } from '../utils/contract-id';

export interface UnstakeArgs {
  currentSignerManagerContractId: string;
}

export function getUnstakeOptions(
  args: UnstakeArgs & { pox5ContractId: string; network: string }
): StxCallContractParams {
  const { currentSignerManagerContractId, pox5ContractId, network } = args;
  const signerManager = parseContractId(currentSignerManagerContractId);
  const functionArgs: ClarityValue[] = [
    contractPrincipalCV(signerManager.contractAddress, signerManager.contractName),
  ];

  return {
    contract: pox5ContractId,
    functionName: 'unstake',
    functionArgs: functionArgs.map(arg => serializeCV(arg)),
    network,
    // Epoch 4.0 Pox post-condition (deny mode): unstake is a gated
    // position-altering action the sender expects to perform.
    postConditions: [
      postConditionToHex({
        type: 'pox-postcondition',
        address: 'origin',
        condition: 'will-perform',
      }),
    ],
    postConditionMode: 'deny',
  } satisfies StxCallContractParams;
}
