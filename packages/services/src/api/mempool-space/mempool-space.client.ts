import { inject, injectable } from 'inversify';
import { TYPES } from 'inversify-types';
import type { NetworkSettingsService } from 'settings/network-settings.service';
import { getMempoolSpaceBaseUrl } from './mempool-space.utils';
import axios from 'axios';

export interface MempoolSpaceApiUtxo {
  txid: string;
}

export interface MempoolSpaceApiClient {
  fetchUtxos(_address: string): Promise<MempoolSpaceApiUtxo[]>;
}

@injectable()
export class MempoolSpaceApiClientImpl implements MempoolSpaceApiClient {
  constructor(
    @inject(TYPES.NetworkSettingsService)
    private readonly _networkSettingsService: NetworkSettingsService
  ) {}

  async fetchUtxos(_address: string): Promise<MempoolSpaceApiUtxo[]> {
    try {
      await axios.get<MempoolSpaceApiUtxo[]>(
        getMempoolSpaceBaseUrl(this._networkSettingsService.getConfig().id)
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
    return [];
  }
}
