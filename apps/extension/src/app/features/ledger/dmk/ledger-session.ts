import type { DeviceManagementKit, DeviceSessionId } from '@ledgerhq/device-management-kit';

import { logger } from '@shared/logger';

export async function closeLedgerSession(
  dmk: DeviceManagementKit,
  sessionId: DeviceSessionId
): Promise<void> {
  try {
    await dmk.disconnect({ sessionId });
  } catch (error) {
    logger.warn('Failed to close the Ledger device session', error);
  }
}
