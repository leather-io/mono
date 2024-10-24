import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

import {
  CryptoAssetCategories,
  CryptoAssetChains,
  CryptoAssetProtocols,
  Src20CryptoAssetInfo,
  createCryptoAssetBalance,
} from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { Src20Token, createGetStampsByAddressQueryOptions } from './stamps-by-address.query';

export function useStampsByAddress(address: string) {
  return useQuery({
    ...createGetStampsByAddressQueryOptions(address),
    select: resp => resp.data?.stamps,
  });
}

function createSrc20CryptoAssetInfo(src20: Src20Token): Src20CryptoAssetInfo {
  return {
    chain: CryptoAssetChains.bitcoin,
    category: CryptoAssetCategories.fungible,
    protocol: CryptoAssetProtocols.src20,
    decimals: 0,
    hasMemo: false,
    id: src20.id ?? '',
    symbol: src20.tick,
  };
}

export function useSrc20TokensByAddress(address: string) {
  return useQuery({
    ...createGetStampsByAddressQueryOptions(address),
    select: resp =>
      resp.data.src20.map(token => ({
        balance: createCryptoAssetBalance(
          createMoney(new BigNumber(token.amt ?? 0), token.tick, 0)
        ),
        info: createSrc20CryptoAssetInfo(token),
      })),
  });
}
