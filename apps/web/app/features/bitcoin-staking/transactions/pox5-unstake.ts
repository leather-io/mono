import { StackingClient } from '@stacks/stacking';
import {
  ClarityValue,
  contractPrincipalCV,
  postConditionToHex,
  serializeCV,
} from '@stacks/transactions';
import { BitcoinStakingProviderId } from '~/data/bitcoin-staking-data';
import {
  POX5_WALLET_RPC_CONTRACT_NETWORK,
  POX5_WALLET_RPC_NETWORK,
} from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { analytics } from '~/utils/analytics/analytics';
import { StxCallContractParams } from '~/utils/leather-sdk';

import { LeatherSdk } from '@leather.io/sdk';

import { parseContractId } from '../utils/contract-id';
import { getPox5ContractId } from '../utils/pox5-contracts';
import { getCycleContextFromPoxInfo } from '../utils/pox5-cycle-clock';

interface UnstakeArgs {
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

interface UnstakeMutationValues extends UnstakeArgs {
  providerId: BitcoinStakingProviderId;
}

interface CreateUnstakeMutationOptionsArgs {
  leather: LeatherSdk;
  client: StackingClient;
}

export function createUnstakeMutationOptions({
  leather,
  client,
}: CreateUnstakeMutationOptionsArgs) {
  return {
    mutationKey: ['pox5-unstake', leather, client],
    mutationFn: async (values: UnstakeMutationValues) => {
      const poxInfo = await client.getPoxInfo();
      const { clock } = getCycleContextFromPoxInfo(poxInfo);
      if (clock.isInPreparePhase) {
        throw new Error('Unstaking is unavailable during the prepare phase.');
      }

      const options = getUnstakeOptions({
        currentSignerManagerContractId: values.currentSignerManagerContractId,
        pox5ContractId: getPox5ContractId(POX5_WALLET_RPC_CONTRACT_NETWORK),
        network: POX5_WALLET_RPC_NETWORK,
      });

      analytics.track('bitcoin_staking_unstaked', { provider: values.providerId });

      return leather.stxCallContract(options);
    },
  } as const;
}
