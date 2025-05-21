import { cvToValue, hexToCV } from '@stacks/transactions';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { getLiquidContract } from '~/features/stacking/start-liquid-stacking/utils/utils-preset-protocols';
import { getNetworkInstanceByName } from '~/features/stacking/start-pooled-stacking/utils/utils-stacking-pools';
import { CreateProtocolFeeQueryOptionsParams } from '~/queries/protocols/protocol-types';
import { useStacksClient } from '~/queries/stacks/stacks-client';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';

export function createGetDaoFeeQueryOptions({
  address,
  networkMode,
  client,
}: CreateProtocolFeeQueryOptionsParams) {
  return {
    queryKey: ['dao-get-stack-fee', address, networkMode],
    enabled: !!address && !!networkMode,
    queryFn: async () => {
      const daoContract = getLiquidContract(networkMode, 'WrapperStackingDAO')?.split('.');
      const [contractAddress, contractName] = daoContract || [];

      if (!contractAddress || !contractName) {
        return null;
      }

      const res = await client.callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-stack-fee',
        readOnlyFunctionArgs: {
          arguments: [],
          sender: address!,
        },
      });

      if (!res.okay || !res.result) {
        return new BigNumber(0);
      }

      const resultCV = hexToCV(res.result);
      const result = cvToValue(resultCV);

      return new BigNumber(result);
    },
  };
}

export function useDaoFee() {
  const client = useStacksClient();
  const { stacksAccount } = useLeatherConnect();
  const address = stacksAccount?.address;

  const network = useStacksNetwork();
  const networkMode = getNetworkInstanceByName(network.networkName);

  return useQuery(createGetDaoFeeQueryOptions({ client, networkMode, address }));
}
