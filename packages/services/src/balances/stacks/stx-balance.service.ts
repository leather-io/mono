import { StxCryptoAssetBalance } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { MempoolSpaceApiClient } from '../../api/mempool-space/mempool-space.client';

export interface StxBalanceService {
  getStxBalance(address: string): Promise<StxCryptoAssetBalance>;
}

export function createStxBalanceService(mempoolSpaceClient: MempoolSpaceApiClient) {
  async function getStxBalance(address: string) {
    let totalBalance = 0;
    if (address && mempoolSpaceClient) {
      totalBalance++;
    }
    return {
      availableBalance: createMoney(totalBalance, 'USD'),
      protectedBalance: createMoney(0, 'USD'),
      uneconomicalBalance: createMoney(0, 'USD'),
      availableUnlockedBalance: createMoney(0, 'USD'),
      inboundBalance: createMoney(0, 'USD'),
      lockedBalance: createMoney(0, 'USD'),
      outboundBalance: createMoney(0, 'USD'),
      pendingBalance: createMoney(0, 'USD'),
      totalBalance: createMoney(0, 'USD'),
      unlockedBalance: createMoney(0, 'USD'),
    };
  }
  return {
    getStxBalance,
  };
}
