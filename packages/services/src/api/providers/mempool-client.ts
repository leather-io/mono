import { Utxo } from "@leather.io/models";
import { injectable } from "inversify";

export interface MempoolUtxo {
  // who knows
}


@injectable()
export class MempoolClient {
  async fetchUtxos(_address: string): Promise<MempoolUtxo[]> {
    return [];
  }

  mapUtxo(utxo: MempoolUtxo): Utxo {
    return {
      ...utxo
    } as Utxo
  }
}