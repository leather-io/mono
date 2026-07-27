import { StackingClient } from '@stacks/stacking';
import {
  ClarityValue,
  contractPrincipalCV,
  postConditionToHex,
  serializeCV,
  uintCV,
} from '@stacks/transactions';
import { BitcoinStakingProviderId } from '~/data/bitcoin-staking-data';
import {
  POX5_MAX_NUM_CYCLES,
  POX5_WALLET_RPC_CONTRACT_NETWORK,
  POX5_WALLET_RPC_NETWORK,
} from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { analytics } from '~/utils/analytics/analytics';
import { StxCallContractParams } from '~/utils/leather-sdk';

import { LeatherSdk } from '@leather.io/sdk';

import { parseContractId } from '../utils/contract-id';
import { getPox5ContractId } from '../utils/pox5-contracts';
import { getCycleContextFromPoxInfo, getStakeStartBurnHeight } from '../utils/pox5-cycle-clock';
import { Pox5PayoutPreference, encodeSignerCalldata } from './pox5-signer-calldata';

interface StakeArgs {
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

interface StakeMutationValues {
  providerId: BitcoinStakingProviderId;
  signerManagerContractId: string;
  amountMicroStx: bigint;
  numCycles: number;
  payoutPreference?: Pox5PayoutPreference;
}

interface CreateStakeMutationOptionsArgs {
  leather: LeatherSdk;
  client: StackingClient;
}

export function createStakeMutationOptions({ leather, client }: CreateStakeMutationOptionsArgs) {
  return {
    mutationKey: ['pox5-stake', leather, client],
    mutationFn: async (values: StakeMutationValues) => {
      // Fetched at submit time: the contract rejects a start-burn-ht that does
      // not resolve to the next reward cycle, so a cached height near a cycle
      // boundary would make the transaction fail.
      const poxInfo = await client.getPoxInfo();
      const { currentBurnHeight, clock } = getCycleContextFromPoxInfo(poxInfo);
      if (clock.isInPreparePhase) {
        throw new Error('Staking is unavailable during the prepare phase.');
      }

      const options = getStakeOptions({
        signerManagerContractId: values.signerManagerContractId,
        amountMicroStx: values.amountMicroStx,
        numCycles: values.numCycles,
        payoutPreference: values.payoutPreference,
        startBurnHeight: getStakeStartBurnHeight(currentBurnHeight),
        pox5ContractId: getPox5ContractId(POX5_WALLET_RPC_CONTRACT_NETWORK),
        network: POX5_WALLET_RPC_NETWORK,
      });

      analytics.track('bitcoin_staking_started', {
        provider: values.providerId,
        amountMicroStx: values.amountMicroStx.toString(),
        numCycles: values.numCycles,
      });

      return leather.stxCallContract(options);
    },
  } as const;
}
