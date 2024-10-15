import { StxCryptoAssetBalance } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';
import { injectable } from 'inversify';

export interface StxBalanceService {
  getStxBalance(address: string): Promise<StxCryptoAssetBalance>;
}

@injectable()
export class StxBalanceServiceImpl implements StxBalanceService {
  constructor() {}

  async getStxBalance(address: string) {
    let totalBalance = 0;
    if (address) {
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
}
