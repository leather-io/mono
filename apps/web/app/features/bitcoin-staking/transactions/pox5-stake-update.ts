import { StackingClient } from '@stacks/stacking';
import {
  ClarityValue,
  contractPrincipalCV,
  postConditionToHex,
  serializeCV,
  uintCV,
} from '@stacks/transactions';
import { BitcoinStakingProviderId } from '~/data/bitcoin-staking-data';
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { POX5_MAX_NUM_CYCLES } from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { analytics } from '~/utils/analytics/analytics';
import { StxCallContractParams } from '~/utils/leather-sdk';

import { LeatherSdk } from '@leather.io/sdk';

import { parseContractId } from '../utils/contract-id';
import { getPox5ContractId } from '../utils/pox5-contracts';
import { getCycleContextFromPoxInfo } from '../utils/pox5-cycle-clock';
import { Pox5PayoutPreference, encodeSignerCalldata } from './pox5-signer-calldata';

// One builder covers all three position changes: extending (cyclesToExtend > 0),
// increasing (amountIncreaseMicroStx > 0), and switching pools (a different
// newSignerManagerContractId). Zero values are valid for the unchanged parts.
interface StakeUpdateArgs {
  newSignerManagerContractId: string;
  currentSignerManagerContractId: string;
  cyclesToExtend: number;
  amountIncreaseMicroStx: bigint;
  // The position's currently locked amount, needed for the staking
  // post-condition: with an amount increase the node logs the RESULTING TOTAL
  // (current + increase) as the staked amount (pox-locking pox_5.rs
  // handle_stake_lockup_update_pox_v5).
  currentAmountMicroStx: bigint;
  payoutPreference?: Pox5PayoutPreference;
}

export function getStakeUpdateOptions(
  args: StakeUpdateArgs & { pox5ContractId: string; network: string }
): StxCallContractParams {
  const {
    newSignerManagerContractId,
    currentSignerManagerContractId,
    cyclesToExtend,
    amountIncreaseMicroStx,
    currentAmountMicroStx,
    payoutPreference,
    pox5ContractId,
    network,
  } = args;

  if (
    !Number.isInteger(cyclesToExtend) ||
    cyclesToExtend < 0 ||
    cyclesToExtend > POX5_MAX_NUM_CYCLES
  ) {
    throw new Error(
      `Expected cyclesToExtend to be an integer between 0 and ${POX5_MAX_NUM_CYCLES}.`
    );
  }
  if (amountIncreaseMicroStx < 0n) {
    throw new Error('Expected amountIncreaseMicroStx to be zero or positive.');
  }

  const newSignerManager = parseContractId(newSignerManagerContractId);
  const currentSignerManager = parseContractId(currentSignerManagerContractId);
  const functionArgs: ClarityValue[] = [
    contractPrincipalCV(newSignerManager.contractAddress, newSignerManager.contractName),
    contractPrincipalCV(currentSignerManager.contractAddress, currentSignerManager.contractName),
    uintCV(cyclesToExtend),
    uintCV(amountIncreaseMicroStx),
    encodeSignerCalldata(payoutPreference),
  ];

  return {
    contract: pox5ContractId,
    functionName: 'stake-update',
    functionArgs: functionArgs.map(arg => serializeCV(arg)),
    network,
    // Epoch 4.0 Staking post-condition (deny mode). With an amount increase
    // the node logs the RESULTING TOTAL (current + increase) as the staked
    // amount, so eq checks the total, not the increase. For cycles-only
    // extends node builds disagree: the devnet node image logs no staking
    // amount (0) while the pox-wf-integration tip logs the unchanged total
    // (pox-locking pox_5.rs handle_stake_lockup_update_pox_v5) — lte the
    // total passes on both while still capping what may be staked.
    postConditions: [
      postConditionToHex({
        type: 'staking-postcondition',
        address: 'origin',
        condition: amountIncreaseMicroStx > 0n ? 'eq' : 'lte',
        amount: currentAmountMicroStx + amountIncreaseMicroStx,
      }),
    ],
    postConditionMode: 'deny',
  } satisfies StxCallContractParams;
}

interface StakeUpdateMutationValues extends StakeUpdateArgs {
  providerId: BitcoinStakingProviderId;
}

interface CreateStakeUpdateMutationOptionsArgs {
  leather: LeatherSdk;
  client: StackingClient;
}

export function createStakeUpdateMutationOptions({
  leather,
  client,
}: CreateStakeUpdateMutationOptionsArgs) {
  return {
    mutationKey: ['pox5-stake-update', leather, client],
    mutationFn: async (values: StakeUpdateMutationValues) => {
      const poxInfo = await client.getPoxInfo();
      const { clock } = getCycleContextFromPoxInfo(poxInfo);
      if (clock.isInPreparePhase) {
        throw new Error('Staking updates are unavailable during the prepare phase.');
      }

      const options = getStakeUpdateOptions({
        newSignerManagerContractId: values.newSignerManagerContractId,
        currentSignerManagerContractId: values.currentSignerManagerContractId,
        cyclesToExtend: values.cyclesToExtend,
        amountIncreaseMicroStx: values.amountIncreaseMicroStx,
        currentAmountMicroStx: values.currentAmountMicroStx,
        payoutPreference: values.payoutPreference,
        pox5ContractId: getPox5ContractId(pox5NetworkConfig.contractNetworkMode),
        network: pox5NetworkConfig.walletRpcNetwork,
      });

      analytics.track('bitcoin_staking_updated', {
        provider: values.providerId,
        amountIncreaseMicroStx: values.amountIncreaseMicroStx.toString(),
        cyclesToExtend: values.cyclesToExtend,
      });

      return leather.stxCallContract(options);
    },
  } as const;
}
