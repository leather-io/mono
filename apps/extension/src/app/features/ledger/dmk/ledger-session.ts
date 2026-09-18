import type { DeviceManagementKit, DeviceSessionId } from '@ledgerhq/device-management-kit';

import { logger } from '@shared/logger';

import { safeAwait } from '@app/common/utils/safe-await';

export async function closeLedgerSession(
  dmk: DeviceManagementKit,
  sessionId: DeviceSessionId
): Promise<void> {
  const [error] = await safeAwait(dmk.disconnect({ sessionId }));
  if (error) logger.warn('Failed to close the Ledger device session', error);
}
