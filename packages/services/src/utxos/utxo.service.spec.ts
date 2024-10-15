import { describe, expect, it, vi } from 'vitest';

import { Utxo } from '@leather.io/models';

import { BlockbookApiClient } from '../api/blockbook/blockbook.client';
import { MempoolSpaceApiClient } from '../api/mempool-space/mempool-space.client';
import { NetworkSettingsService } from '../settings/network-settings.service';
import { createUtxoService } from './utxo.service';

describe('UtxoService', () => {
  const mockUtxos = [{}, {}] as Utxo[];
  const mockNetworkSettings: NetworkSettingsService = {
    getConfig: vi.fn(),
  };
  const mockMempoolClient: MempoolSpaceApiClient = {
    fetchUtxos: vi.fn().mockResolvedValue(mockUtxos),
  };
  const mockBlockbookClient: BlockbookApiClient = {
    fetchAccountUtxos: vi.fn().mockResolvedValue(mockUtxos),
    fetchAccountBalance: vi.fn(),
  };

  it('should fetch UTXOs from Blockbook when on mainnet', async () => {
    mockNetworkSettings.getConfig = vi.fn().mockReturnValue({ id: 'mainnet' });
    mockBlockbookClient.fetchAccountUtxos = vi.fn().mockResolvedValue(mockUtxos);

    const utxoService = createUtxoService(
      mockNetworkSettings,
      mockMempoolClient,
      mockBlockbookClient
    );
    const result = await utxoService.getUtxos('someDescriptor');

    expect(mockNetworkSettings.getConfig).toHaveBeenCalled();
    expect(mockBlockbookClient.fetchAccountUtxos).toHaveBeenCalledWith('someDescriptor');
    expect(result).toEqual(mockUtxos);
  });

  it('should fetch UTXOs from MempoolSpace when on testnet', async () => {
    mockNetworkSettings.getConfig = vi.fn().mockReturnValue({ id: 'testnet' });

    const utxoService = createUtxoService(
      mockNetworkSettings,
      mockMempoolClient,
      mockBlockbookClient
    );
    const result = await utxoService.getUtxos('someDescriptor');

    expect(mockNetworkSettings.getConfig).toHaveBeenCalled();
    expect(mockMempoolClient.fetchUtxos).toHaveBeenCalledWith('someDescriptor');
    expect(result).toEqual(mockUtxos);
  });

  it('should throw an error for unsupported networks', async () => {
    mockNetworkSettings.getConfig = vi.fn().mockReturnValue({ id: 'unsupported' });

    const utxoService = createUtxoService(
      mockNetworkSettings,
      mockMempoolClient,
      mockBlockbookClient
    );
    await expect(utxoService.getUtxos('someDescriptor')).rejects.toThrow('Network not recognized');
  });
});
