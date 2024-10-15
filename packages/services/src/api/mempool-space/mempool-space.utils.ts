import { DefaultNetworkConfigurations, Utxo } from '@leather.io/models';

import { MempoolSpaceApiUtxo } from './mempool-space.client';

export const MEMPOOLSPACE_API_BASE_URL = 'https://mempool.space/api/v1';

export function getMempoolSpaceBaseUrl(networkId: string) {
  switch (networkId as DefaultNetworkConfigurations) {
    default:
      return MEMPOOLSPACE_API_BASE_URL;
  }
}

export function mapMempoolUtxo(utxo: MempoolSpaceApiUtxo): Utxo {
  return {
    ...utxo,
  } as Utxo;
}
