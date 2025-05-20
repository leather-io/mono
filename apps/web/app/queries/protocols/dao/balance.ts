import { cvToValue, hexToCV, principalCV, serializeCV } from '@stacks/transactions';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { getLiquidContract } from '~/features/stacking/start-liquid-stacking/utils/utils-preset-protocols';
import { getNetworkInstanceByName } from '~/features/stacking/start-pooled-stacking/utils/utils-stacking-pools';
import { useStacksClient } from '~/queries/stacks/stacks-client';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';

const StackingDaoTokenContractMap: Record<string, string> = {
  'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v4':
    'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-token',
};

export function useDaoBalance() {
  const client = useStacksClient();
  const { stacksAccount } = useLeatherConnect();
  const address = stacksAccount?.address;

  const network = useStacksNetwork();
  const networkMode = getNetworkInstanceByName(network.networkName);

  const daoContract = getLiquidContract(networkMode, 'WrapperStackingDAO');
  const daoTokenContract = StackingDaoTokenContractMap[daoContract]?.split('.');
  const [contractAddress, contractName] = daoTokenContract || [];

  return useQuery({
    queryKey: ['dao-get-balance', address, contractAddress, contractName],
    enabled: !!address && !!contractAddress && !!contractName,
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const principal = principalCV(address);
      const serialized = serializeCV(principal);
      const hexArg = `0x${serialized}`;

      const res = await client.callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-balance',
        readOnlyFunctionArgs: {
          arguments: [hexArg],
          sender: address,
        },
      });

      if (!res.okay || !res.result) {
        return new BigNumber(0);
      }

      const resultCV = hexToCV(res.result);
      const result = cvToValue(resultCV);

      return new BigNumber(result.value);
    },
  });
}
