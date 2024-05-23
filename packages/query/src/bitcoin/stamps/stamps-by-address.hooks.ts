import { Src20CryptoAssetInfo, createCryptoAssetBalance } from '@leather-wallet/models';
import { createMoney } from '@leather-wallet/utils';
import BigNumber from 'bignumber.js';

import { Src20Token, useStampsByAddressQuery } from './stamps-by-address.query';

export function useStampsByAddress(address: string) {
  return useStampsByAddressQuery(address, {
    select: resp => resp.data?.stamps,
  });
}

function createSrc20CryptoAssetInfo(src20: Src20Token): Src20CryptoAssetInfo {
  return {
    decimals: 0,
    hasMemo: false,
    id: src20.id ?? '',
    name: 'src-20',
    symbol: src20.tick,
  };
}

export function useSrc20TokensByAddress(address: string) {
  return useStampsByAddressQuery(address, {
    select: resp =>
      resp.data.src20.map(token => ({
        balance: createCryptoAssetBalance(
          createMoney(new BigNumber(token.amt ?? 0), token.tick, 0)
        ),
        info: createSrc20CryptoAssetInfo(token),
      })),
  });
}
