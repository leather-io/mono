import {
  ClarityValue,
  contractPrincipalCV,
  postConditionToHex,
  serializeCV,
  uintCV,
} from '@stacks/transactions';
import { POX5_MAX_NUM_CYCLES } from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { StxCallContractParams } from '~/utils/leather-sdk';

import { parseContractId } from '../utils/contract-id';
import { Pox5PayoutPreference, encodeSignerCalldata } from './pox5-signer-calldata';

export interface StakeArgs {
  signerManagerContractId: string;
  amountMicroStx: bigint;
  numCycles: number;
  startBurnHeight: number;
  payoutPreference?: Pox5PayoutPreference;
}

export function getStakeOptions(
  args: StakeArgs & { pox5ContractId: string; network: string }
): StxCallContractParams {
  const {
    signerManagerContractId,
    amountMicroStx,
    numCycles,
    startBurnHeight,
    payoutPreference,
    pox5ContractId,
    network,
  } = args;

  if (!Number.isInteger(numCycles) || numCycles < 1 || numCycles > POX5_MAX_NUM_CYCLES) {
    throw new Error(`Expected numCycles to be an integer between 1 and ${POX5_MAX_NUM_CYCLES}.`);
  }

  const signerManager = parseContractId(signerManagerContractId);
  const functionArgs: ClarityValue[] = [
    contractPrincipalCV(signerManager.contractAddress, signerManager.contractName),
    uintCV(amountMicroStx),
    uintCV(numCycles),
    uintCV(startBurnHeight),
    encodeSignerCalldata(payoutPreference),
  ];

  return {
    contract: pox5ContractId,
    functionName: 'stake',
    functionArgs: functionArgs.map(arg => serializeCV(arg)),
    network,
    // Epoch 4.0 requires the staked amount to be covered by a Staking
    // post-condition under deny mode: exactly amount-ustx staked by the sender.
    postConditions: [
      postConditionToHex({
        type: 'staking-postcondition',
        address: 'origin',
        condition: 'eq',
        amount: amountMicroStx,
      }),
    ],
    postConditionMode: 'deny',
  } satisfies StxCallContractParams;
}
