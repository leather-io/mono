import { StacksNetworkName } from '@stacks/network';
import { StackingClient } from '@stacks/stacking';
import { serializeCV } from '@stacks/transactions';
import { useMutation } from '@tanstack/react-query';
import { analytics } from '~/features/analytics/analytics';
import { leather } from '~/helpers/leather-sdk';
import { useStacksNetwork } from '~/store/stacks-network';

import { LeatherSdk } from '@leather.io/sdk';
import { formatContractId } from '@leather.io/stacks';

import { useStackingClientRequired } from '../providers/stacking-client-provider';

export interface CreateRevokeDelegateStxMutationArgs {
  leather: LeatherSdk;
  network: StacksNetworkName;
  client: StackingClient;
}

export function createRevokeDelegateStxMutationOptions({
  leather,
  network,
  client,
}: CreateRevokeDelegateStxMutationArgs) {
  return {
    mutationKey: ['revoke-delegate-stx', leather, network],
    mutationFn: async () => {
      const stackingContract = await client.getStackingContract();
      const revokeDelegationOptions = client.getRevokeDelegateStxOptions(stackingContract);
      void analytics.untypedTrack('stacking_revoke_delegate');
      return leather.stxCallContract({
        contract: formatContractId(
          revokeDelegationOptions.contractAddress,
          revokeDelegationOptions.contractName
        ),
        functionName: revokeDelegationOptions.functionName,
        functionArgs: revokeDelegationOptions.functionArgs.map(arg => serializeCV(arg)),
        network,
      });
    },
  } as const;
}

export function useRevokeDelegateStxMutation() {
  const { networkName } = useStacksNetwork();
  const { client } = useStackingClientRequired();

  return useMutation(
    createRevokeDelegateStxMutationOptions({
      client,
      leather,
      network: networkName,
    })
  );
}
