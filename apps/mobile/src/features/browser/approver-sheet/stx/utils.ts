import { calculateDefaultStacksFee } from '@/features/send/utils';
import { App, assertAppIsConnected } from '@/store/apps/utils';

import { createMoneyFromDecimal } from '@leather.io/utils';

export function getDefaultFee() {
  const defaultFee = calculateDefaultStacksFee();
  return createMoneyFromDecimal(defaultFee, 'STX');
}

export function getAccountIdFromConnectedApp(app: App) {
  assertAppIsConnected(app);

  return app.accountId;
}
