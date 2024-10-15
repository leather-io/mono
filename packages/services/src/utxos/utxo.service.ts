import { NetworkModes, Utxo } from '@leather.io/models';
import type { BlockbookApiClient } from 'api/blockbook/blockbook.client';
import { mapBlockbookUtxo } from 'api/blockbook/blockbook.utils';
import type { MempoolSpaceApiClient } from 'api/mempool-space/mempool-space.client';
import { mapMempoolUtxo } from 'api/mempool-space/mempool-space.utils';
import { inject, injectable } from 'inversify';
import { TYPES } from 'inversify-types';

export interface UtxoService {
  getUtxos(descriptor: string, network: NetworkModes): Promise<Utxo[]>;
}

@injectable()
export class UtxoServiceImpl implements UtxoService {
  constructor(
    @inject(TYPES.MempoolSpaceApiClient) private readonly _mempoolClient: MempoolSpaceApiClient,
    @inject(TYPES.BlockbookApiClient) private readonly _blockbookClient: BlockbookApiClient
  ) {}

  async getUtxos(descriptor: string, network: NetworkModes) {
    switch (network) {
      case 'mainnet':
        return await this._getBlockbookUtxos(descriptor);
      case 'testnet':
        return await this._getMempoolUtxos(descriptor);
    }
  }

  private async _getMempoolUtxos(descriptor: string): Promise<Utxo[]> {
    return (await this._mempoolClient.fetchUtxos(descriptor)).map(mapMempoolUtxo);
  }

  private async _getBlockbookUtxos(descriptor: string): Promise<Utxo[]> {
    return (await this._blockbookClient.fetchAccountUtxos(descriptor)).map(mapBlockbookUtxo);
  }
}
