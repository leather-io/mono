import { createLeatherClient } from '@leather.io/sdk';

export const leather = createLeatherClient({
  onProviderNotFound() {
    // TODO: Update store to show no leather installed msg
  },
});
