import axios from 'axios';

import { NetworkSettingsService } from '../../settings/network-settings.service';
import { getMempoolSpaceBaseUrl } from './mempool-space.utils';

export interface MempoolSpaceApiUtxo {
  txid: string;
}

export interface MempoolSpaceApiClient {
  fetchUtxos(_address: string): Promise<MempoolSpaceApiUtxo[]>;
}

export function createMempoolSpaceApiClient(networkSettings: NetworkSettingsService) {
  async function fetchUtxos(_address: string): Promise<MempoolSpaceApiUtxo[]> {
    try {
      await axios.get<MempoolSpaceApiUtxo[]>(
        getMempoolSpaceBaseUrl(networkSettings.getConfig().id)
      );
    } catch (e) {
      // log?
      throw e;
    }
    return [];
  }
  return {
    fetchUtxos,
  };
}
