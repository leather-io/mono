import { BtcCryptoAssetBalance, NetworkModes } from "@leather.io/models";
import { createMoney } from "@leather.io/utils";
import { BlockbookClient } from "api/providers/blockbook-client";
import { injectable } from "inversify";
import { UtxoService } from "utxos/utxo.service";
import { BtcCompositeBalance, BtcSubBalance } from "./dto/bitcoin-composite-balance.dto";

@injectable()
export class BitcoinBalanceService {

  private _blockbookClient: BlockbookClient;
  private _utxoService: UtxoService;

  constructor(blockbookClient: BlockbookClient, utxoService: UtxoService) {
    this._blockbookClient = blockbookClient;
    this._utxoService = utxoService;
  }

  async getBtcCompositeBalance(descriptors: string[]): Promise<BtcCompositeBalance> {
    const subBalances: BtcSubBalance[] = [];
    let totalBalance = 0;
    for (const descriptor of descriptors) {
      const balance = await this.getBtcBalance(descriptor);
      totalBalance += balance.availableBalance.amount.toNumber();
      subBalances.push({
        descriptor,
        balance
      });
    }
    return {
      availableBalance: createMoney(totalBalance, 'USD'),
      protectedBalance: createMoney(0, 'USD'),
      uneconomicalBalance: createMoney(0, 'USD'),
      subBalances
    }
  }
  
  async getBtcBalance(descriptor: string): Promise<BtcCryptoAssetBalance> {
    return this._blockbookClient.mapBalance(
      await this._blockbookClient.fetchAccountBalance(descriptor)
    )
  }

  async getUtxoBalance(descriptor: string, network: NetworkModes): Promise<BtcCryptoAssetBalance> {
    const utxos = await this._utxoService.getUtxos(descriptor, network);
    utxos; // temporary disable eslint warning
    // filter utxos
    // calculate balance
    return {
      availableBalance: createMoney(0, 'USD'),
      protectedBalance: createMoney(0, 'USD'),
      uneconomicalBalance: createMoney(0, 'USD'),
    };
  }

}