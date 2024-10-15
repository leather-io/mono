import { NetworkModes, Utxo } from '@leather.io/models';

import { BlockbookApiClient } from '../api/blockbook/blockbook.client';
import { mapBlockbookUtxo } from '../api/blockbook/blockbook.utils';
import { MempoolSpaceApiClient } from '../api/mempool-space/mempool-space.client';
import { mapMempoolUtxo } from '../api/mempool-space/mempool-space.utils';
import { NetworkSettingsService } from '../settings/network-settings.service';

export interface UtxoService {
  getUtxos(descriptor: string, network: NetworkModes): Promise<Utxo[]>;
}

export function createUtxoService(
  networkSettings: NetworkSettingsService,
  mempoolClient: MempoolSpaceApiClient,
  blockbookClient: BlockbookApiClient
) {
  async function getUtxos(descriptor: string) {
    switch (networkSettings.getConfig().id) {
      case 'mainnet':
        return await _getBlockbookUtxos(descriptor);
      case 'testnet':
        return await _getMempoolUtxos(descriptor);
      default:
        throw new Error('Network not recognized');
    }
  }

  async function _getMempoolUtxos(descriptor: string): Promise<Utxo[]> {
    return (await mempoolClient.fetchUtxos(descriptor)).map(mapMempoolUtxo);
  }

  async function _getBlockbookUtxos(descriptor: string): Promise<Utxo[]> {
    return (await blockbookClient.fetchAccountUtxos(descriptor)).map(mapBlockbookUtxo);
  }

  return {
    getUtxos,
  };
}
