import { createLeatherClient } from '@leather.io/sdk';

export const leather = createLeatherClient({
  onProviderNotFound() {
    // TODO: Update store to show no leather installed msg
  },
});

export type StxCallContractParams = Parameters<typeof leather.stxCallContract>[0];
