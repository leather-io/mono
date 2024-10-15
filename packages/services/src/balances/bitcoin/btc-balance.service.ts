import { BtcCryptoAssetBalance, Money, NetworkModes } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';
import type { BlockbookApiClient } from 'api/blockbook/blockbook.client';
import { mapBlockbookBalance } from 'api/blockbook/blockbook.utils';
import { inject, injectable } from 'inversify';
import { TYPES } from 'inversify-types';
import type { UtxoService } from 'utxos/utxo.service';

export interface BtcCompositeBalance {
  availableBalance: Money;
  protectedBalance: Money;
  uneconomicalBalance: Money;
  subBalances: BtcSubBalance[];
}

export interface BtcSubBalance {
  descriptor: string;
  balance: BtcCryptoAssetBalance;
}

export interface BtcBalanceService {
  getBtcCompositeBalance(descriptors: string[]): Promise<BtcCompositeBalance>;
  getBtcBalance(descriptor: string): Promise<BtcCryptoAssetBalance>;
  getUtxoBalance(descriptor: string, network: NetworkModes): Promise<BtcCryptoAssetBalance>;
}

@injectable()
export class BtcBalanceServiceImpl implements BtcBalanceService {
  constructor(
    @inject(TYPES.BlockbookApiClient) private readonly _blockbookClient: BlockbookApiClient,
    @inject(TYPES.UtxoSerivce) private readonly _utxoService: UtxoService
  ) {}

  async getBtcCompositeBalance(descriptors: string[]) {
    const subBalances: BtcSubBalance[] = [];
    let totalBalance = 0;
    for (const descriptor of descriptors) {
      const balance = await this.getBtcBalance(descriptor);
      totalBalance += balance.availableBalance.amount.toNumber();
      subBalances.push({
        descriptor,
        balance,
      });
    }
    return {
      availableBalance: createMoney(totalBalance, 'USD'),
      protectedBalance: createMoney(0, 'USD'),
      uneconomicalBalance: createMoney(0, 'USD'),
      subBalances,
    };
  }

  async getBtcBalance(descriptor: string) {
    return mapBlockbookBalance(await this._blockbookClient.fetchAccountBalance(descriptor));
  }

  async getUtxoBalance(descriptor: string, network: NetworkModes) {
    const utxos = await this._utxoService.getUtxos(descriptor, network);
    let balance = 0;
    for (const utxo of utxos) {
      // filter utxos
      // calculate balance
      if (utxo.value) {
        balance++;
      }
    }
    return {
      availableBalance: createMoney(balance, 'USD'),
      protectedBalance: createMoney(0, 'USD'),
      uneconomicalBalance: createMoney(0, 'USD'),
    };
  }
}
