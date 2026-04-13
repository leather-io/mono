import { cvToValue, hexToCV } from '@stacks/transactions';
import BigNumber from 'bignumber.js';
import { getLiquidContract } from '~/features/stacking/start-liquid-stacking/utils/utils-preset-protocols';
import { CreateProtocolFeeQueryOptionsParams } from '~/queries/protocols/protocol-types';

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
