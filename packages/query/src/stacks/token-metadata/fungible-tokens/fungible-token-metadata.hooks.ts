import { useQueries } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

import { createCryptoAssetBalance } from '@leather.io/models';
import { createMoney, getPrincipalFromContractId, getTicker } from '@leather.io/utils';

import { useCurrentNetworkState } from '../../../leather-query-provider';
import { AddressBalanceResponse } from '../../hiro-api-types';
import { createSip10CryptoAssetInfo } from '../../sip10/sip10-tokens.utils';
import { useStacksClient } from '../../stacks-client';
import { getStacksContractIdStringParts } from '../../temp-utils';
import { FtAssetResponse, isFtAsset } from '../token-metadata.utils';
import { createGetFungibleTokenMetadataQueryOptions } from './fungible-token-metadata.query';

export function useStacksFungibleTokensBalance(
  ftBalances: AddressBalanceResponse['fungible_tokens']
) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();

  return useQueries({
    queries: Object.entries(ftBalances).map(([key, value]) => {
      const address = getPrincipalFromContractId(key);
      return {
        ...createGetFungibleTokenMetadataQueryOptions({
          address,
          client,
          network: network.chain.stacks.url,
        }),
        select: (resp: FtAssetResponse) => {
          if (!(resp && isFtAsset(resp))) return;
          const { contractAssetName } = getStacksContractIdStringParts(key);
          const name = resp.name || contractAssetName;
          const symbol = resp.symbol || getTicker(name);
          return {
            contractId: key,
            balance: createCryptoAssetBalance(
              createMoney(new BigNumber(value.balance), symbol, resp.decimals ?? 0)
            ),
          };
        },
      };
    }),
  });
}

export function useStacksFungibleTokensMetadata(keys: string[]) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();

  return useQueries({
    queries: keys.map(key => {
      const address = getPrincipalFromContractId(key);
      return {
        ...createGetFungibleTokenMetadataQueryOptions({
          address,
          client,
          network: network.chain.stacks.url,
        }),
        select: (resp: FtAssetResponse) => {
          if (!(resp && isFtAsset(resp))) return;
          return createSip10CryptoAssetInfo(key, resp);
        },
      };
    }),
  });
}
