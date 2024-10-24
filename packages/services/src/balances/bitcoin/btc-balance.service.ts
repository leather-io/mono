import { BtcCryptoAssetBalance, Money, NetworkModes } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { BlockbookApiClient } from '../../api/blockbook/blockbook.client';
import { mapBlockbookBalance } from '../../api/blockbook/blockbook.utils';
import { UtxoService } from '../../utxos/utxo.service';

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

export function createBtcBalanceService(
  blockbookClient: BlockbookApiClient,
  utxoService: UtxoService
) {
  async function getBtcCompositeBalance(descriptors: string[]) {
    const subBalances: BtcSubBalance[] = [];
    let totalBalance = 0;
    for (const descriptor of descriptors) {
      const balance = await getBtcBalance(descriptor);
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

  async function getBtcBalance(descriptor: string) {
    return mapBlockbookBalance(await blockbookClient.fetchAccountBalance(descriptor));
  }

  async function getUtxoBalance(descriptor: string, network: NetworkModes) {
    const utxos = await utxoService.getUtxos(descriptor, network);
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

  return {
    getBtcCompositeBalance,
    getBtcBalance,
    getUtxoBalance,
  };
}
