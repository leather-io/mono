import { cvToValue, hexToCV, serializeCV, uintCV } from '@stacks/transactions';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { getLiquidContract } from '~/features/stacking/start-liquid-stacking/utils/utils-preset-protocols';
import { getNetworkInstanceByName } from '~/features/stacking/start-pooled-stacking/utils/utils-stacking-pools';
import { useNftHoldingsQuery } from '~/queries/balance/nft-holdings';
import { useStacksClient } from '~/queries/stacks/stacks-client';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';

const STATUS_MAP: Record<string, string> = {
  '0x00': 'pending',
  '0x01': 'approved',
  '0x02': 'rejected',
};

const LISA_NFT_IDENTIFIER = 'li-stx-mint-nft::li-stx-mint';

export interface LisaMintRequest {
  id: number;
  amount: BigNumber;
  requestedAt: number;
  requestedBy: string;
  status: string;
}

export function useLisaBalance() {
  const client = useStacksClient();
  const { stacksAccount } = useLeatherConnect();
  const address = stacksAccount?.address;

  const network = useStacksNetwork();
  const networkMode = getNetworkInstanceByName(network.networkName);

  const lisaContract = getLiquidContract(networkMode, 'Lisa').split('.');
  const [contractAddress, contractName] = lisaContract || [];

  const nftQuery = useNftHoldingsQuery();

  return useQuery({
    queryKey: [
      'lisa-mint-requests',
      address,
      nftQuery.data?.results,
      contractAddress,
      contractName,
    ],
    enabled: !!address && nftQuery.isSuccess && !!contractName && !!contractName,
    queryFn: async () => {
      const results = nftQuery.data?.results ?? [];

      const lisaNftIds = results
        .filter(nft => nft.asset_identifier.endsWith(LISA_NFT_IDENTIFIER))
        .map(nft => {
          const id = parseInt(nft.value.repr.replace('u', ''), 10);
          const clarityValue = uintCV(BigInt(id));
          const serialized = serializeCV(clarityValue);
          return `0x${serialized}`;
        });

      const requests = await Promise.all(
        lisaNftIds.map(async id => {
          const res = await client.callReadOnlyFunction({
            contractAddress,
            contractName,
            functionName: 'get-mint-request-or-fail',
            readOnlyFunctionArgs: {
              arguments: [id],
              sender: address!,
            },
          });

          if (!res.okay || !res.result) {
            return null;
          }

          const resultCV = hexToCV(res.result);
          const result = cvToValue(resultCV);

          const amount = new BigNumber(result.value.amount.value);
          const statusHex = result.value.status.value as string;
          const status = STATUS_MAP[statusHex] ?? 'unknown';

          return { amount, status };
        })
      );

      return (
        requests
          ?.filter(r => r?.status === 'pending')
          .reduce((sum, r) => sum.plus(r?.amount ?? 0), new BigNumber(0)) ?? new BigNumber(0)
      );
    },
  });
}
