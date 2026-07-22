import { StacksNetworkName } from '@stacks/network';
import { StackingClient } from '@stacks/stacking';
import { ClarityValue, contractPrincipalCV, serializeCV, uintCV } from '@stacks/transactions';
import { BitcoinStakingProviderId } from '~/data/bitcoin-staking-data';
import { getNetworkInstanceByName } from '~/features/stacking/utils/stacking-network-utils';
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
  payoutPreference?: Pox5PayoutPreference;
}

export function getStakeUpdateOptions(
  args: StakeUpdateArgs & { pox5ContractId: string; network: StacksNetworkName }
): StxCallContractParams {
  const {
    newSignerManagerContractId,
    currentSignerManagerContractId,
    cyclesToExtend,
    amountIncreaseMicroStx,
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
  } satisfies StxCallContractParams;
}

interface StakeUpdateMutationValues extends StakeUpdateArgs {
  providerId: BitcoinStakingProviderId;
}

interface CreateStakeUpdateMutationOptionsArgs {
  leather: LeatherSdk;
  client: StackingClient;
  network: StacksNetworkName;
}

export function createStakeUpdateMutationOptions({
  leather,
  client,
  network,
}: CreateStakeUpdateMutationOptionsArgs) {
  return {
    mutationKey: ['pox5-stake-update', leather, client, network],
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
        payoutPreference: values.payoutPreference,
        pox5ContractId: getPox5ContractId(getNetworkInstanceByName(network)),
        network,
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
