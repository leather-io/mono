import { StacksNetworkName } from '@stacks/network';
import { StackingClient } from '@stacks/stacking';
import { ClarityValue, contractPrincipalCV, serializeCV } from '@stacks/transactions';
import { BitcoinStakingProviderId } from '~/data/bitcoin-staking-data';
import { getNetworkInstanceByName } from '~/features/stacking/utils/stacking-network-utils';
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
  args: UnstakeArgs & { pox5ContractId: string; network: StacksNetworkName }
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
  } satisfies StxCallContractParams;
}

interface UnstakeMutationValues extends UnstakeArgs {
  providerId: BitcoinStakingProviderId;
}

interface CreateUnstakeMutationOptionsArgs {
  leather: LeatherSdk;
  client: StackingClient;
  network: StacksNetworkName;
}

export function createUnstakeMutationOptions({
  leather,
  client,
  network,
}: CreateUnstakeMutationOptionsArgs) {
  return {
    mutationKey: ['pox5-unstake', leather, client, network],
    mutationFn: async (values: UnstakeMutationValues) => {
      const poxInfo = await client.getPoxInfo();
      const { clock } = getCycleContextFromPoxInfo(poxInfo);
      if (clock.isInPreparePhase) {
        throw new Error('Unstaking is unavailable during the prepare phase.');
      }

      const options = getUnstakeOptions({
        currentSignerManagerContractId: values.currentSignerManagerContractId,
        pox5ContractId: getPox5ContractId(getNetworkInstanceByName(network)),
        network,
      });

      analytics.track('bitcoin_staking_unstaked', { provider: values.providerId });

      return leather.stxCallContract(options);
    },
  } as const;
}
