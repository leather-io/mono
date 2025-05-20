import { cvToValue, hexToCV } from '@stacks/transactions';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { getLiquidContract } from '~/features/stacking/start-liquid-stacking/utils/utils-preset-protocols';
import { getNetworkInstanceByName } from '~/features/stacking/start-pooled-stacking/utils/utils-stacking-pools';
import { useStacksClient } from '~/queries/stacks/stacks-client';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';

export function useDAOFee() {
  const client = useStacksClient();
  const { stacksAccount } = useLeatherConnect();
  const address = stacksAccount?.address;

  const network = useStacksNetwork();
  const networkMode = getNetworkInstanceByName(network.networkName);

  const daoContract = getLiquidContract(networkMode, 'WrapperStackingDAO')?.split('.');
  const [contractAddress, contractName] = daoContract || [];

  return useQuery({
    queryKey: ['dao-get-stack-fee', address, contractAddress, contractName],
    enabled: !!address && !!contractAddress && !!contractName,
    queryFn: async () => {
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
  });
}
