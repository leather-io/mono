import { NetworkModes, Utxo } from "@leather.io/models";
import { BlockbookClient } from "api/providers/blockbook-client";
import { MempoolClient } from "api/providers/mempool-client";
import { injectable } from "inversify";

@injectable()
export class UtxoService {

  private _mempoolClient: MempoolClient;
  private _blockbookClient: BlockbookClient;

  constructor(mempoolClient: MempoolClient, blockbookClient: BlockbookClient) {
    this._mempoolClient = mempoolClient;
    this._blockbookClient = blockbookClient;
  }

  async getUtxos(descriptor: string, network: NetworkModes): Promise<Utxo[]> {
    switch (network) {
      case "mainnet":
        return await this.getBlockbookUtxos(descriptor)
      case "testnet":
        return await this.getMempoolUtxos(descriptor)
    }
  }

  private async getMempoolUtxos(descriptor: string): Promise<Utxo[]> {
    return (await this._mempoolClient.fetchUtxos(descriptor)).map(this._mempoolClient.mapUtxo)
  }

  private async getBlockbookUtxos(descriptor: string): Promise<Utxo[]> {
    return (await this._blockbookClient.fetchAccountUtxos(descriptor)).map(this._blockbookClient.mapUtxo)
  }

}